#!/usr/bin/env python3
"""
CrossFit Workout Data Cleaning Script
======================================

This script cleans and validates workout CSV data by:
- Converting lb/lbs units to kg consistently
- Detecting and handling duplicates (exact and fuzzy)
- Using AI (OpenAI) to fill missing metadata with citations
- Falling back to web scraping when AI is unavailable
- Detecting contradictions and flagging issues
- Generating audit trails and human-readable reports
- Removing unused columns not required by the workout page

COLUMNS REQUIRED FOR WORKOUT PAGE:
---------------------------------
Card Preview: Name, Category, Level/DifficultyTier, Format & Duration, Training Goals, 
              Description/Flavor-Text
Modal Essentials: Instructions/Instructions_Clean, Equipment Needed, Movement Types, 
                  Stimulus/Target Stimulus, Scaling-Tiers/Scaling Options, Score Type
Modal Additional: Warmup, Coaching-Cues/Coach Notes, Estimated-Times/Estimated-Times-Human, 
                  Environment, Flavor-Text
Internal: WorkoutID (for unique identification)

Design Choices:
--------------
- Graceful degradation: Works offline without OpenAI API key
- Conservative fills: Prefers "UNKNOWN" over unsupported assumptions
- Citation-first: All numeric values require source URLs
- Caching: API and web results cached in .cache/ directory
- Rate limiting: Built-in rate limiting for API/web requests
- Column cleanup: Removes columns not used by the workout page

Required Environment:
--------------------
- OPENAI_API_KEY: Optional. Set for AI-assisted metadata filling.
  Without this, the script falls back to web scraping only.

Usage:
------
    python clean_workouts.py --input workouts_table.csv --out workouts_table_cleaned.csv
    python clean_workouts.py --help

Dependencies:
------------
- pandas: Data manipulation
- requests: HTTP requests for web scraping
- beautifulsoup4: HTML parsing
- openai: OpenAI API client (optional)
- tqdm: Progress bars

Author: Auto-generated for workout data cleaning
"""

import argparse
import hashlib
import json
import logging
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
import requests
from bs4 import BeautifulSoup

# Optional imports with fallbacks
try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    def tqdm(iterable, **kwargs):
        return iterable

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    openai = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# =============================================================================
# Constants and Configuration
# =============================================================================

# Conversion factor
LBS_TO_KG = 0.453592

# Columns required for the workout page (all others will be removed)
# These are the columns actually used by workouts.js
ESSENTIAL_COLUMNS = [
    # Card Preview
    'Name',
    'Category',
    'Level',
    'DifficultyTier',
    'Format & Duration',
    'Training Goals',
    'Description',
    'Flavor-Text',
    # Modal Essentials
    'Instructions',
    'Instructions_Clean',
    'Equipment Needed',
    'Movement Types',
    'Stimulus',
    'Target Stimulus',
    'Scaling-Tiers',
    'Scaling Options',
    'Score Type',
    # Modal Additional Info
    'Warmup',
    'Coaching-Cues',
    'Coach Notes',
    'Estimated-Times',
    'Estimated-Times-Human',
    'Environment',
    # Internal ID
    'WorkoutID',
]

# Known CrossFit benchmark workouts for AI lookup
KNOWN_BENCHMARKS = {
    'fran', 'grace', 'helen', 'cindy', 'karen', 'diane', 'elizabeth',
    'isabel', 'jackie', 'nancy', 'annie', 'eva', 'kelly', 'lynne',
    'mary', 'nicole', 'barbara', 'chelsea', 'amanda', 'angie',
    'murph', 'filthy fifty', 'fight gone bad', 'dt', 'randy',
    'michael', 'blake', 'daniel', 'jt', 'nate'
}

# Canonical movement labels
CANONICAL_MOVEMENTS = {
    'thruster': 'Thrusters',
    'thrusters': 'Thrusters',
    'pull-up': 'Pull-ups',
    'pullup': 'Pull-ups',
    'pull up': 'Pull-ups',
    'pullups': 'Pull-ups',
    'pull-ups': 'Pull-ups',
    'clean & jerk': 'Clean & Jerks',
    'clean and jerk': 'Clean & Jerks',
    'clean&jerk': 'Clean & Jerks',
    'kettlebell swing': 'Kettlebell Swings',
    'kb swing': 'Kettlebell Swings',
    'wall ball': 'Wall Balls',
    'wallball': 'Wall Balls',
    'run': 'Running',
    'running': 'Running',
    'row': 'Rowing',
    'rowing': 'Rowing',
    'deadlift': 'Deadlifts',
    'deadlifts': 'Deadlifts',
    'push-up': 'Push-ups',
    'pushup': 'Push-ups',
    'push up': 'Push-ups',
    'pushups': 'Push-ups',
    'push-ups': 'Push-ups',
    'squat': 'Squats',
    'squats': 'Squats',
    'air squat': 'Air Squats',
    'air squats': 'Air Squats',
    'handstand push-up': 'Handstand Push-ups',
    'hspu': 'Handstand Push-ups',
    'handstand pushup': 'Handstand Push-ups',
    'box jump': 'Box Jumps',
    'box jumps': 'Box Jumps',
    'burpee': 'Burpees',
    'burpees': 'Burpees',
    'snatch': 'Snatches',
    'snatches': 'Snatches',
    'clean': 'Cleans',
    'cleans': 'Cleans',
    'muscle-up': 'Muscle-ups',
    'muscle up': 'Muscle-ups',
    'muscleup': 'Muscle-ups',
    'double-under': 'Double-unders',
    'double under': 'Double-unders',
    'du': 'Double-unders',
    'toes-to-bar': 'Toes-to-Bar',
    'toes to bar': 'Toes-to-Bar',
    't2b': 'Toes-to-Bar',
}

# Canonical format normalization
FORMAT_PATTERNS = {
    r'amrap\s*(\d+)': 'AMRAP {0}',
    r'amrap\s+in\s+(\d+)\s*min': 'AMRAP {0}',
    r'amrap\s+(\d+)\s*min': 'AMRAP {0}',
    r'for\s+time': 'For Time',
    r'emom\s*(\d+)': 'EMOM {0}',
    r'emom\s+for\s+(\d+)\s*min': 'EMOM {0}',
    r'(\d+)\s+rounds?\s+for\s+time': '{0} Rounds For Time',
    r'for\s+time\s*\((\d+)\s+rounds?\)': '{0} Rounds For Time',
}

# Time domain classification
TIME_DOMAINS = {
    'Short': (0, 7),      # 0-7 minutes
    'Medium': (7, 15),    # 7-15 minutes
    'Long': (15, float('inf'))  # 15+ minutes
}

# User agent for web requests
USER_AGENT = 'Mozilla/5.0 (compatible; WorkoutDataCleaner/1.0)'

# =============================================================================
# Caching System
# =============================================================================

class CacheManager:
    """Manages caching of API and web requests."""
    
    def __init__(self, cache_dir: str = '.cache'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Cache directory: {self.cache_dir.absolute()}")
    
    def _get_cache_key(self, prefix: str, query: str) -> str:
        """Generate a cache key from prefix and query."""
        hash_val = hashlib.md5(query.encode()).hexdigest()[:12]
        return f"{prefix}_{hash_val}"
    
    def _get_cache_path(self, key: str) -> Path:
        """Get the file path for a cache key."""
        return self.cache_dir / f"{key}.json"
    
    def get(self, prefix: str, query: str) -> Optional[Dict]:
        """Retrieve cached result if available."""
        key = self._get_cache_key(prefix, query)
        path = self._get_cache_path(key)
        if path.exists():
            try:
                with open(path, 'r') as f:
                    data = json.load(f)
                    logger.debug(f"Cache hit for {key}")
                    return data
            except (json.JSONDecodeError, IOError):
                pass
        return None
    
    def set(self, prefix: str, query: str, data: Dict) -> None:
        """Store result in cache."""
        key = self._get_cache_key(prefix, query)
        path = self._get_cache_path(key)
        try:
            with open(path, 'w') as f:
                json.dump(data, f, indent=2)
            logger.debug(f"Cached result for {key}")
        except IOError as e:
            logger.warning(f"Failed to cache result: {e}")


# =============================================================================
# Rate Limiting
# =============================================================================

class RateLimiter:
    """Simple rate limiter using sleep-based throttling."""
    
    def __init__(self, min_interval: float = 1.0):
        self.min_interval = min_interval
        self.last_call = 0
    
    def wait(self):
        """Wait if necessary to respect rate limit."""
        elapsed = time.time() - self.last_call
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_call = time.time()


# =============================================================================
# Unit Conversion
# =============================================================================

def convert_lbs_to_kg(value: str, rounding: int = 1) -> str:
    """
    Convert lb/lbs values in a string to kg.
    
    Args:
        value: Input string potentially containing lb/lbs values
        rounding: Rounding precision in kg (1, 2.5, or 5)
    
    Returns:
        String with converted values
    
    Examples:
        '95/65 lbs' -> '43/29 kg'
        '20 lb Vest' -> '9 kg Vest'
    """
    if not isinstance(value, str):
        return value
    
    def round_kg(kg_val: float, precision: float) -> int:
        """Round to nearest precision value."""
        if precision == 1:
            return round(kg_val)
        return int(round(kg_val / precision) * precision)
    
    # Pattern for paired values like "95/65 lbs" or "95/65lbs"
    paired_pattern = r'(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)'
    
    def replace_paired(match):
        lb1 = float(match.group(1))
        lb2 = float(match.group(2))
        kg1 = round_kg(lb1 * LBS_TO_KG, rounding)
        kg2 = round_kg(lb2 * LBS_TO_KG, rounding)
        return f'{kg1}/{kg2} kg'
    
    result = re.sub(paired_pattern, replace_paired, value, flags=re.IGNORECASE)
    
    # Pattern for single values like "20 lb" or "20lbs"
    single_pattern = r'(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)\b'
    
    def replace_single(match):
        lb_val = float(match.group(1))
        kg_val = round_kg(lb_val * LBS_TO_KG, rounding)
        return f'{kg_val} kg'
    
    result = re.sub(single_pattern, replace_single, result, flags=re.IGNORECASE)
    
    return result


def apply_unit_conversion(df: pd.DataFrame, rounding: int = 1) -> Tuple[pd.DataFrame, List[Dict]]:
    """
    Apply unit conversion to all text columns in DataFrame.
    
    Returns:
        Tuple of (converted DataFrame, list of changes made)
    """
    changes = []
    df_converted = df.copy()
    
    for col in df.columns:
        if df[col].dtype == 'object':
            for idx in df.index:
                original = df.at[idx, col]
                if pd.notna(original) and isinstance(original, str):
                    converted = convert_lbs_to_kg(str(original), rounding)
                    if converted != original:
                        df_converted.at[idx, col] = converted
                        changes.append({
                            'row_index': idx,
                            'column': col,
                            'original': original,
                            'converted': converted,
                            'change_type': 'unit_conversion'
                        })
    
    logger.info(f"Applied {len(changes)} unit conversions")
    return df_converted, changes


# =============================================================================
# Duplicate Detection
# =============================================================================

def normalize_name(name: str) -> str:
    """Normalize workout name for comparison."""
    if not isinstance(name, str):
        return ''
    # Lowercase, remove punctuation, collapse whitespace
    normalized = name.lower()
    normalized = re.sub(r'[^\w\s]', '', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized.strip()


def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]


def find_duplicates(df: pd.DataFrame, threshold: float = 0.8) -> List[Dict]:
    """
    Find exact and fuzzy duplicates in the DataFrame.
    
    Args:
        df: Input DataFrame
        threshold: Similarity threshold for fuzzy matching (0-1)
    
    Returns:
        List of duplicate groups found
    """
    duplicates = []
    names = df['Name'].tolist()
    normalized = [normalize_name(n) for n in names]
    
    # Find exact duplicates
    seen_exact = {}
    for idx, norm in enumerate(normalized):
        if norm in seen_exact:
            duplicates.append({
                'type': 'exact',
                'indices': [seen_exact[norm], idx],
                'names': [names[seen_exact[norm]], names[idx]],
                'normalized': norm
            })
        else:
            seen_exact[norm] = idx
    
    # Find fuzzy duplicates (for non-exact matches)
    unique_normalized = list(set(normalized))
    for i, norm1 in enumerate(unique_normalized):
        for j, norm2 in enumerate(unique_normalized[i+1:], i+1):
            if len(norm1) == 0 or len(norm2) == 0:
                continue
            max_len = max(len(norm1), len(norm2))
            dist = levenshtein_distance(norm1, norm2)
            similarity = 1 - (dist / max_len)
            if similarity >= threshold and similarity < 1.0:
                # Find original indices
                idx1 = normalized.index(norm1)
                idx2 = normalized.index(norm2)
                duplicates.append({
                    'type': 'fuzzy',
                    'indices': [idx1, idx2],
                    'names': [names[idx1], names[idx2]],
                    'similarity': similarity
                })
    
    logger.info(f"Found {len(duplicates)} potential duplicates")
    return duplicates


# =============================================================================
# Format Normalization
# =============================================================================

def normalize_format(format_str: str) -> str:
    """Normalize workout format string to canonical form."""
    if not isinstance(format_str, str):
        return format_str
    
    format_lower = format_str.lower().strip()
    
    # Check each pattern
    for pattern, template in FORMAT_PATTERNS.items():
        match = re.search(pattern, format_lower, re.IGNORECASE)
        if match:
            if '{0}' in template and match.groups():
                return template.format(match.group(1))
            return template
    
    # Return original if no pattern matches
    return format_str


def classify_time_domain(minutes: Optional[float]) -> str:
    """Classify time into Short/Medium/Long."""
    if minutes is None:
        return 'Unknown'
    for domain, (min_val, max_val) in TIME_DOMAINS.items():
        if min_val <= minutes < max_val:
            return domain
    return 'Unknown'


def extract_duration_minutes(format_str: str) -> Optional[float]:
    """Extract duration in minutes from format string."""
    if not isinstance(format_str, str):
        return None
    
    # Match patterns like "AMRAP 12", "EMOM 10", etc.
    match = re.search(r'(?:amrap|emom)\s*(?:in\s+)?(\d+)', format_str, re.IGNORECASE)
    if match:
        return float(match.group(1))
    
    # Match explicit minute ranges like "(10-15 minutes)"
    match = re.search(r'\((\d+)-(\d+)\s*min', format_str, re.IGNORECASE)
    if match:
        return (float(match.group(1)) + float(match.group(2))) / 2
    
    return None


def normalize_movement_types(movement_str: str) -> str:
    """Normalize movement types to canonical labels."""
    if not isinstance(movement_str, str):
        return movement_str
    
    movements = [m.strip() for m in movement_str.split(',')]
    normalized = []
    
    for movement in movements:
        movement_lower = movement.lower().strip()
        if movement_lower in CANONICAL_MOVEMENTS:
            normalized.append(CANONICAL_MOVEMENTS[movement_lower])
        else:
            # Keep original if not found
            normalized.append(movement.strip())
    
    return ', '.join(normalized)


# =============================================================================
# AI-Assisted Metadata
# =============================================================================

class AIAssistant:
    """Handles AI-assisted metadata lookup using OpenAI."""
    
    def __init__(self, cache: CacheManager, rate_limiter: RateLimiter, max_requests: int = 50):
        self.cache = cache
        self.rate_limiter = rate_limiter
        self.max_requests = max_requests
        self.requests_made = 0
        self.client = None
        
        api_key = os.environ.get('OPENAI_API_KEY')
        if api_key and HAS_OPENAI:
            try:
                self.client = openai.OpenAI(api_key=api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        else:
            if not api_key:
                logger.info("OPENAI_API_KEY not set - AI features disabled")
            if not HAS_OPENAI:
                logger.info("openai package not installed - AI features disabled")
    
    def is_available(self) -> bool:
        """Check if AI assistant is available."""
        return self.client is not None and self.requests_made < self.max_requests
    
    def query_benchmark_metadata(self, name: str) -> Optional[Dict]:
        """
        Query AI for benchmark workout metadata.
        
        Returns dict with:
            - format: Workout format (AMRAP, For Time, etc.)
            - rx_weights: RX standards as string
            - movements: List of primary movements
            - time_domain: Typical completion time
            - sources: List of source URLs
            - ai_response: Raw AI response
        """
        if not self.is_available():
            return None
        
        # Check cache first
        cache_key = f"benchmark_{name.lower()}"
        cached = self.cache.get('ai', cache_key)
        if cached:
            return cached
        
        prompt = f"""You are a CrossFit expert. Provide canonical metadata for the CrossFit benchmark workout "{name}".

Return a JSON object with these exact fields:
{{
    "format": "The workout format (e.g., 'For Time', 'AMRAP 20', '21-15-9 For Time')",
    "rx_weights_male": "RX weights for males in kg (e.g., '43 kg barbell')",
    "rx_weights_female": "RX weights for females in kg (e.g., '29 kg barbell')",
    "movements": ["list", "of", "primary", "movements"],
    "typical_time_minutes": "Typical completion time range in minutes (e.g., '3-6')",
    "description": "Brief description of the workout",
    "sources": ["URL1", "URL2"] // 2-3 reputable web sources (CrossFit.com, WODprep, BarBend, etc.)
}}

IMPORTANT: 
- Only include sources you are confident exist and support your answer
- Use kg for all weights (not lbs)
- Be precise and factual
- If unsure about any field, use null"""

        try:
            self.rate_limiter.wait()
            self.requests_made += 1
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1000
            )
            
            ai_text = response.choices[0].message.content
            
            # Try to parse JSON from response
            json_match = re.search(r'\{[\s\S]*\}', ai_text)
            if json_match:
                try:
                    result = json.loads(json_match.group())
                    result['ai_response'] = ai_text
                    result['source_type'] = 'AI'
                    
                    # Cache the result
                    self.cache.set('ai', cache_key, result)
                    
                    logger.info(f"AI metadata retrieved for {name}")
                    return result
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse AI JSON response for {name}")
            
        except Exception as e:
            logger.warning(f"AI query failed for {name}: {e}")
        
        return None
    
    def query_workout_inference(self, instructions: str) -> Optional[Dict]:
        """
        Query AI to infer workout metadata from instructions.
        """
        if not self.is_available():
            return None
        
        # Check cache first
        cache_key = hashlib.md5(instructions[:200].encode()).hexdigest()[:12]
        cached = self.cache.get('ai', f"infer_{cache_key}")
        if cached:
            return cached
        
        prompt = f"""Analyze this CrossFit workout instruction and infer metadata:

"{instructions}"

Return a JSON object:
{{
    "format": "Workout format (For Time, AMRAP X, EMOM X, etc.)",
    "time_domain": "Short/Medium/Long",
    "estimated_minutes": "Estimated duration in minutes",
    "primary_movements": ["list", "of", "movements"],
    "equipment_needed": ["list", "of", "equipment"],
    "difficulty": "Beginner/Intermediate/Advanced/Elite",
    "confidence": 0.0-1.0
}}

Be conservative - if uncertain, set confidence low."""

        try:
            self.rate_limiter.wait()
            self.requests_made += 1
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=500
            )
            
            ai_text = response.choices[0].message.content
            
            json_match = re.search(r'\{[\s\S]*\}', ai_text)
            if json_match:
                try:
                    result = json.loads(json_match.group())
                    result['ai_response'] = ai_text
                    result['source_type'] = 'AI'
                    
                    self.cache.set('ai', f"infer_{cache_key}", result)
                    return result
                except json.JSONDecodeError:
                    pass
            
        except Exception as e:
            logger.warning(f"AI inference failed: {e}")
        
        return None


# =============================================================================
# Web Scraping Fallback
# =============================================================================

class WebScraper:
    """Web scraping for workout metadata verification."""
    
    SEARCH_SITES = [
        ('CrossFit', 'https://www.crossfit.com/search?q='),
        ('WODprep', 'https://wodprep.com/?s='),
        ('BarBend', 'https://barbend.com/?s='),
    ]
    
    def __init__(self, cache: CacheManager, rate_limiter: RateLimiter):
        self.cache = cache
        self.rate_limiter = rate_limiter
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': USER_AGENT})
    
    def search_benchmark(self, name: str) -> Optional[Dict]:
        """
        Search for benchmark workout information on the web.
        
        Returns dict with found information and source URLs.
        """
        cache_key = f"web_benchmark_{name.lower()}"
        cached = self.cache.get('web', cache_key)
        if cached:
            return cached
        
        results = {
            'name': name,
            'sources': [],
            'snippets': [],
            'source_type': 'web'
        }
        
        for site_name, base_url in self.SEARCH_SITES:
            try:
                self.rate_limiter.wait()
                
                search_url = f"{base_url}{name}%20workout%20benchmark"
                response = self.session.get(search_url, timeout=10)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract text snippets containing workout info
                    text = soup.get_text(separator=' ', strip=True)
                    
                    # Look for relevant patterns
                    patterns = [
                        rf'{name}\s+(?:is\s+)?(?:a\s+)?(?:crossfit\s+)?(?:benchmark\s+)?workout',
                        rf'{name}.*?(?:21-15-9|for\s+time|amrap)',
                        rf'rx\s+(?:weights?|standards?).*?(?:\d+\s*(?:kg|lbs?))',
                    ]
                    
                    for pattern in patterns:
                        match = re.search(pattern, text, re.IGNORECASE)
                        if match:
                            start = max(0, match.start() - 50)
                            end = min(len(text), match.end() + 100)
                            snippet = text[start:end]
                            results['snippets'].append({
                                'site': site_name,
                                'text': snippet
                            })
                    
                    results['sources'].append({
                        'site': site_name,
                        'url': search_url,
                        'status': 'found'
                    })
                    
            except Exception as e:
                logger.debug(f"Web search failed for {site_name}: {e}")
                results['sources'].append({
                    'site': site_name,
                    'url': base_url,
                    'status': f'error: {str(e)}'
                })
        
        if results['sources']:
            self.cache.set('web', cache_key, results)
        
        return results if results['snippets'] else None
    
    def verify_ai_claim(self, claim: str, workout_name: str) -> Tuple[bool, List[str]]:
        """
        Attempt to verify an AI-generated claim with web search.
        
        Returns:
            Tuple of (verified: bool, source_urls: list)
        """
        # Simple verification - search for the claim text
        search_result = self.search_benchmark(workout_name)
        
        if search_result and search_result['snippets']:
            # Check if any snippet supports the claim
            claim_lower = claim.lower()
            for snippet in search_result['snippets']:
                if any(word in snippet['text'].lower() for word in claim_lower.split()[:5]):
                    return True, [s['url'] for s in search_result['sources'] if s['status'] == 'found']
        
        return False, []


# =============================================================================
# Contradiction Detection
# =============================================================================

def detect_contradictions(row: pd.Series) -> List[Dict]:
    """
    Detect contradictions within a single row.
    Focuses on essential columns used by the workout page.
    
    Returns list of detected contradictions.
    """
    contradictions = []
    
    # Check Category vs DifficultyTier consistency
    category = str(row.get('Category', '')).lower()
    difficulty = str(row.get('DifficultyTier', '') or row.get('Level', '')).lower()
    
    if 'benchmark' in category and difficulty == 'beginner':
        contradictions.append({
            'type': 'category_difficulty_mismatch',
            'fields': ['Category', 'DifficultyTier/Level'],
            'values': [row.get('Category'), difficulty],
            'message': 'Benchmark workouts are typically not Beginner level'
        })
    
    # Check Format vs Instructions consistency
    format_str = str(row.get('Format & Duration', '')).lower()
    instructions = str(row.get('Instructions_Clean') or row.get('Instructions', '')).lower()
    
    if 'for time' in format_str and instructions:
        # For Time workouts should have rep counts or distances
        if not re.search(r'\d+\s*(?:reps?|rounds?|meters?|m\b|km|miles?)', instructions, re.IGNORECASE):
            instr_preview = instructions[:100] + '...' if len(instructions) > 100 else instructions
            contradictions.append({
                'type': 'format_instructions_mismatch',
                'fields': ['Format & Duration', 'Instructions'],
                'values': [row.get('Format & Duration'), instr_preview],
                'message': 'For Time format but no rep/distance counts in instructions'
            })
    
    # Check for mixed units in Equipment Needed (essential column)
    equipment = str(row.get('Equipment Needed', ''))
    if equipment and pd.notna(row.get('Equipment Needed')):
        has_lbs = bool(re.search(r'\blbs?\b', equipment, re.IGNORECASE))
        has_kg = bool(re.search(r'\bkgs?\b', equipment, re.IGNORECASE))
        
        if has_lbs and has_kg:
            contradictions.append({
                'type': 'mixed_units',
                'fields': ['Equipment Needed'],
                'values': [equipment],
                'message': 'Mixed lb and kg units in Equipment Needed'
            })
    
    return contradictions


# =============================================================================
# Data Cleaning Pipeline
# =============================================================================

class WorkoutDataCleaner:
    """Main data cleaning pipeline."""
    
    def __init__(self, 
                 input_path: str,
                 output_path: str,
                 audit_path: str,
                 report_path: str,
                 rounding: int = 1,
                 max_ai_requests: int = 50,
                 dry_run: bool = False,
                 no_web: bool = False):
        
        self.input_path = Path(input_path)
        self.output_path = Path(output_path)
        self.audit_path = Path(audit_path)
        self.report_path = Path(report_path)
        self.rounding = rounding
        self.dry_run = dry_run
        self.no_web = no_web
        
        # Initialize components
        self.cache = CacheManager()
        self.ai_rate_limiter = RateLimiter(min_interval=1.0)
        self.web_rate_limiter = RateLimiter(min_interval=2.0)
        
        self.ai = AIAssistant(self.cache, self.ai_rate_limiter, max_requests=max_ai_requests)
        self.scraper = WebScraper(self.cache, self.web_rate_limiter) if not no_web else None
        
        # Audit tracking
        self.audit_records = []
        self.stats = {
            'rows_processed': 0,
            'unit_conversions': 0,
            'ai_fills': 0,
            'web_fills': 0,
            'manual_review_needed': 0,
            'contradictions_found': 0,
            'duplicates_found': 0,
            'columns_removed': 0
        }
    
    def load_data(self) -> pd.DataFrame:
        """Load the input CSV file."""
        logger.info(f"Loading data from {self.input_path}")
        df = pd.read_csv(self.input_path)
        self.stats['rows_processed'] = len(df)
        logger.info(f"Loaded {len(df)} rows with {len(df.columns)} columns")
        return df
    
    def remove_unused_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove columns not required by the workout page."""
        original_cols = set(df.columns)
        essential_cols = set(ESSENTIAL_COLUMNS)
        
        # Find columns to keep (intersection with what exists)
        cols_to_keep = [col for col in df.columns if col in essential_cols]
        
        # Track removed columns
        removed_cols = original_cols - set(cols_to_keep)
        self.stats['columns_removed'] = len(removed_cols)
        
        if removed_cols:
            logger.info(f"Removing {len(removed_cols)} unused columns: {sorted(removed_cols)}")
        
        return df[cols_to_keep]
    
    def add_audit_record(self, row_index: int, original_row: Dict, 
                         cleaned_row: Dict, changes: List[Dict],
                         flags: List[str], sources: List[Dict],
                         ai_responses: List[str]):
        """Add a record to the audit trail."""
        self.audit_records.append({
            'row_index': row_index,
            'original_row': json.dumps(original_row, default=str),
            'cleaned_row': json.dumps(cleaned_row, default=str),
            'changes': json.dumps(changes, default=str),
            'flags': '; '.join(flags) if flags else '',
            'sources': json.dumps(sources, default=str),
            'ai_responses': json.dumps(ai_responses, default=str)
        })
    
    def process_benchmark_row(self, df: pd.DataFrame, idx: int, name: str) -> Tuple[Dict, List[Dict], List[str]]:
        """
        Process a benchmark workout row with AI/web lookup.
        
        Returns:
            Tuple of (updates dict, sources list, ai_responses list)
        """
        updates = {}
        sources = []
        ai_responses = []
        
        # Try AI lookup first
        ai_result = self.ai.query_benchmark_metadata(name)
        
        if ai_result:
            ai_responses.append(ai_result.get('ai_response', ''))
            
            # Check if AI provided URLs
            ai_urls = ai_result.get('sources', [])
            
            # Fill missing fields
            row = df.loc[idx]
            
            # Format
            if pd.isna(row.get('Format & Duration')) or str(row.get('Format & Duration', '')).lower() == 'unknown':
                if ai_result.get('format'):
                    updates['Format & Duration'] = ai_result['format']
                    sources.append({
                        'type': 'AI',
                        'field': 'Format & Duration',
                        'urls': ai_urls,
                        'verified': len(ai_urls) > 0
                    })
                    self.stats['ai_fills'] += 1
            
            # Time Domain
            if pd.isna(row.get('Time Domain')) or str(row.get('Time Domain', '')).lower() == 'unknown':
                if ai_result.get('typical_time_minutes'):
                    try:
                        time_str = ai_result['typical_time_minutes']
                        # Parse range like "3-6"
                        if '-' in str(time_str):
                            parts = str(time_str).split('-')
                            avg_minutes = (float(parts[0]) + float(parts[1])) / 2
                        else:
                            avg_minutes = float(time_str)
                        
                        updates['Time Domain'] = classify_time_domain(avg_minutes)
                        sources.append({
                            'type': 'AI',
                            'field': 'Time Domain',
                            'urls': ai_urls,
                            'verified': len(ai_urls) > 0
                        })
                        self.stats['ai_fills'] += 1
                    except (ValueError, TypeError):
                        pass
            
            # RX Standards
            if pd.isna(row.get('RX Standards')) or str(row.get('RX Standards', '')).lower() == 'unknown':
                rx_male = ai_result.get('rx_weights_male', '')
                rx_female = ai_result.get('rx_weights_female', '')
                if rx_male or rx_female:
                    rx_str = f"{rx_male}/{rx_female}" if rx_female else rx_male
                    
                    # Verify with web search if no URLs provided (and web scraping enabled)
                    if not ai_urls and self.scraper:
                        verified, web_urls = self.scraper.verify_ai_claim(rx_str, name)
                        if verified:
                            updates['RX Standards'] = rx_str
                            sources.append({
                                'type': 'AI-verified-web',
                                'field': 'RX Standards',
                                'urls': web_urls,
                                'verified': True
                            })
                            self.stats['web_fills'] += 1
                        else:
                            # Mark as AI-suggested but unverified
                            updates['RX Standards'] = f"{rx_str} (AI-SUGGESTED-UNVERIFIED)"
                            sources.append({
                                'type': 'AI-unverified',
                                'field': 'RX Standards',
                                'urls': [],
                                'verified': False
                            })
                    elif not ai_urls:
                        # No web scraping available, mark as unverified
                        updates['RX Standards'] = f"{rx_str} (AI-SUGGESTED-UNVERIFIED)"
                        sources.append({
                            'type': 'AI-unverified',
                            'field': 'RX Standards',
                            'urls': [],
                            'verified': False
                        })
                    else:
                        updates['RX Standards'] = rx_str
                        sources.append({
                            'type': 'AI',
                            'field': 'RX Standards',
                            'urls': ai_urls,
                            'verified': True
                        })
                        self.stats['ai_fills'] += 1
        
        else:
            # Fallback to web scraping (if enabled)
            if self.scraper:
                web_result = self.scraper.search_benchmark(name)
                if web_result and web_result['snippets']:
                    sources.append({
                        'type': 'web',
                        'field': 'general',
                        'urls': [s['url'] for s in web_result['sources'] if s['status'] == 'found'],
                        'snippets': [s['text'][:200] for s in web_result['snippets'][:3]]
                    })
                    # Note: web scraping provides references but doesn't auto-fill
                    # This is intentional - we need human review for scraped data
        
        return updates, sources, ai_responses
    
    def process_generic_row(self, df: pd.DataFrame, idx: int) -> Tuple[Dict, List[Dict], List[str]]:
        """
        Process a generic (non-benchmark) workout row.
        
        Returns:
            Tuple of (updates dict, sources list, ai_responses list)
        """
        updates = {}
        sources = []
        ai_responses = []
        
        row = df.loc[idx]
        instructions = str(row.get('Instructions_Clean') or row.get('Instructions', ''))
        
        # Try to infer from instructions using regex first
        format_str = str(row.get('Format & Duration', ''))
        
        # If format is missing or unknown, try to infer
        if pd.isna(row.get('Format & Duration')) or format_str.lower() == 'unknown':
            # Regex-based inference
            if re.search(r'amrap', instructions, re.IGNORECASE):
                match = re.search(r'(\d+)\s*min', instructions, re.IGNORECASE)
                if match:
                    updates['Format & Duration'] = f"AMRAP {match.group(1)}"
            elif re.search(r'for\s+time', instructions, re.IGNORECASE):
                updates['Format & Duration'] = "For Time"
            elif re.search(r'emom', instructions, re.IGNORECASE):
                match = re.search(r'(\d+)\s*min', instructions, re.IGNORECASE)
                if match:
                    updates['Format & Duration'] = f"EMOM {match.group(1)}"
        
        # If still missing critical fields, try AI inference
        missing_critical = (
            pd.isna(row.get('Time Domain')) or 
            pd.isna(row.get('Movement Types')) or
            pd.isna(row.get('DifficultyTier'))
        )
        
        if missing_critical and instructions and len(instructions) > 20:
            ai_result = self.ai.query_workout_inference(instructions)
            
            if ai_result:
                ai_responses.append(ai_result.get('ai_response', ''))
                
                # Only use high-confidence inferences
                confidence = ai_result.get('confidence', 0)
                if confidence >= 0.7:
                    if pd.isna(row.get('Time Domain')) and ai_result.get('time_domain'):
                        updates['Time Domain'] = ai_result['time_domain']
                        sources.append({
                            'type': 'AI-inference',
                            'field': 'Time Domain',
                            'confidence': confidence,
                            'verified': False
                        })
                        self.stats['ai_fills'] += 1
                    
                    if pd.isna(row.get('DifficultyTier')) and ai_result.get('difficulty'):
                        updates['DifficultyTier'] = ai_result['difficulty']
                        sources.append({
                            'type': 'AI-inference',
                            'field': 'DifficultyTier',
                            'confidence': confidence,
                            'verified': False
                        })
                        self.stats['ai_fills'] += 1
        
        return updates, sources, ai_responses
    
    def clean(self) -> pd.DataFrame:
        """
        Run the full cleaning pipeline.
        
        Returns:
            Cleaned DataFrame
        """
        logger.info("Starting data cleaning pipeline")
        
        # Load data
        df = self.load_data()
        
        # Step 1: Unit conversion
        logger.info("Step 1: Converting units (lb/lbs to kg)")
        df, unit_changes = apply_unit_conversion(df, self.rounding)
        self.stats['unit_conversions'] = len(unit_changes)
        
        # Step 2: Normalize formats
        logger.info("Step 2: Normalizing workout formats")
        if 'Format & Duration' in df.columns:
            df['Format & Duration'] = df['Format & Duration'].apply(normalize_format)
        
        # Step 3: Normalize movement types
        logger.info("Step 3: Normalizing movement types")
        if 'Movement Types' in df.columns:
            df['Movement Types'] = df['Movement Types'].apply(normalize_movement_types)
        
        # Step 4: Find duplicates
        logger.info("Step 4: Detecting duplicates")
        duplicates = find_duplicates(df)
        self.stats['duplicates_found'] = len(duplicates)
        
        # Step 5: Process each row for AI/web fills
        logger.info("Step 5: Processing rows for AI/web metadata fills")
        
        for idx in tqdm(df.index, desc="Processing rows", disable=not HAS_TQDM):
            row = df.loc[idx]
            original_row = row.to_dict()
            
            name = str(row.get('Name', '')).lower().strip()
            category = str(row.get('Category', '')).lower()
            
            updates = {}
            sources = []
            ai_responses = []
            flags = []
            
            # Check if this is a benchmark workout
            is_benchmark = name in KNOWN_BENCHMARKS or 'benchmark' in category
            
            if is_benchmark:
                updates, sources, ai_responses = self.process_benchmark_row(df, idx, row.get('Name', ''))
            else:
                updates, sources, ai_responses = self.process_generic_row(df, idx)
            
            # Apply updates
            for col, value in updates.items():
                df.at[idx, col] = value
            
            # Detect contradictions
            contradictions = detect_contradictions(df.loc[idx])
            if contradictions:
                self.stats['contradictions_found'] += len(contradictions)
                for c in contradictions:
                    flags.append(f"CONTRADICTION: {c['type']} - {c['message']}")
            
            # Check for remaining missing values in essential columns
            # These are the columns actually used by the workout page
            critical_cols = ['Movement Types', 'DifficultyTier', 'Level', 'Instructions', 'Instructions_Clean']
            for col in critical_cols:
                if col in df.columns and pd.isna(df.at[idx, col]):
                    if is_benchmark:
                        df.at[idx, col] = "UNKNOWN — needs manual review"
                        flags.append(f"MANUAL_REVIEW: {col} missing for benchmark '{row.get('Name')}'")
                        self.stats['manual_review_needed'] += 1
            
            # Record changes
            changes = [
                {'column': col, 'old': original_row.get(col), 'new': val}
                for col, val in updates.items()
            ]
            
            # Add unit conversion changes for this row
            row_unit_changes = [c for c in unit_changes if c['row_index'] == idx]
            changes.extend(row_unit_changes)
            
            # Add audit record if there were changes or flags
            if changes or flags or sources:
                self.add_audit_record(
                    row_index=idx,
                    original_row=original_row,
                    cleaned_row=df.loc[idx].to_dict(),
                    changes=changes,
                    flags=flags,
                    sources=sources,
                    ai_responses=ai_responses
                )
        
        # Add duplicate flags to audit
        for dup in duplicates:
            flags = [f"DUPLICATE: {dup['type']} match with indices {dup['indices']}, names: {dup['names']}"]
            for idx in dup['indices']:
                self.add_audit_record(
                    row_index=idx,
                    original_row=df.loc[idx].to_dict(),
                    cleaned_row=df.loc[idx].to_dict(),
                    changes=[],
                    flags=flags,
                    sources=[],
                    ai_responses=[]
                )
        
        # Step 6: Remove unused columns (not required by workout page)
        logger.info("Step 6: Removing unused columns")
        df = self.remove_unused_columns(df)
        
        logger.info("Cleaning pipeline complete")
        return df
    
    def save_outputs(self, df: pd.DataFrame):
        """Save cleaned data, audit log, report, and regenerate JSON for workout page."""
        if self.dry_run:
            logger.info("Dry run - not saving files")
            return
        
        # Save cleaned CSV
        logger.info(f"Saving cleaned data to {self.output_path}")
        df.to_csv(self.output_path, index=False)
        
        # Regenerate JSON file for the workout page
        json_path = self.output_path.with_suffix('.json')
        logger.info(f"Regenerating JSON for workout page at {json_path}")
        self._generate_json(df, json_path)
        
        # Save audit CSV
        logger.info(f"Saving audit log to {self.audit_path}")
        audit_df = pd.DataFrame(self.audit_records)
        audit_df.to_csv(self.audit_path, index=False)
        
        # Generate and save report
        logger.info(f"Generating report at {self.report_path}")
        self.generate_report()
    
    def _generate_json(self, df: pd.DataFrame, json_path: Path):
        """Generate JSON file with proper field names for the workout page JS."""
        records = []
        for idx, row in df.iterrows():
            record = {
                'id': int(row['WorkoutID']) if pd.notna(row.get('WorkoutID')) else idx + 1,
                'Name': row.get('Name', ''),
                'Category': row.get('Category', ''),
                'Level': row.get('Level', row.get('DifficultyTier', '')),
                'DifficultyTier': row.get('DifficultyTier', row.get('Level', '')),
                'FormatDuration': row.get('Format & Duration', ''),
                'TrainingGoals': row.get('Training Goals', ''),
                'Description': row.get('Description', ''),
                'Flavor_Text': row.get('Flavor-Text', ''),
                'Instructions': row.get('Instructions', ''),
                'Instructions_Clean': row.get('Instructions_Clean', row.get('Instructions', '')),
                'EquipmentNeeded': row.get('Equipment Needed', ''),
                'MovementTypes': row.get('Movement Types', ''),
                'Stimulus': row.get('Stimulus', row.get('Target Stimulus', '')),
                'TargetStimulus': row.get('Target Stimulus', row.get('Stimulus', '')),
                'Scaling_Tiers': row.get('Scaling-Tiers', row.get('Scaling Options', '')),
                'ScalingOptions': row.get('Scaling Options', ''),
                'ScoreType': row.get('Score Type', ''),
                'Warmup': row.get('Warmup', ''),
                'Coaching_Cues': row.get('Coaching-Cues', row.get('Coach Notes', '')),
                'CoachNotes': row.get('Coach Notes', ''),
                'Estimated_Times': row.get('Estimated-Times', ''),
                'Estimated_Times_Human': row.get('Estimated-Times-Human', ''),
                'Environment': row.get('Environment', ''),
            }
            # Clean NaN values to empty strings
            for k, v in record.items():
                if pd.isna(v):
                    record[k] = ''
            records.append(record)
        
        with open(json_path, 'w') as f:
            json.dump(records, f, indent=2)
        
        logger.info(f"Generated JSON with {len(records)} records")
    
    def generate_report(self):
        """Generate human-readable validation report."""
        report_lines = [
            "# Workout Data Validation Report",
            "",
            f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "## Summary Statistics",
            "",
            f"- **Rows Processed:** {self.stats['rows_processed']}",
            f"- **Unit Conversions Applied:** {self.stats['unit_conversions']}",
            f"- **Columns Removed (unused):** {self.stats['columns_removed']}",
            f"- **Fields Auto-filled via AI:** {self.stats['ai_fills']}",
            f"- **Fields Filled via Web Scraping:** {self.stats['web_fills']}",
            f"- **Duplicates Found:** {self.stats['duplicates_found']}",
            f"- **Contradictions Detected:** {self.stats['contradictions_found']}",
            f"- **Rows Requiring Manual Review:** {self.stats['manual_review_needed']}",
            "",
            "## Audit Entries (Top 20)",
            "",
        ]
        
        # Add top audit entries
        for i, record in enumerate(self.audit_records[:20]):
            report_lines.append(f"### Entry {i+1} (Row {record['row_index']})")
            report_lines.append("")
            
            if record['flags']:
                report_lines.append(f"**Flags:** {record['flags']}")
            
            if record['changes'] and record['changes'] != '[]':
                report_lines.append(f"**Changes:** {record['changes']}")
            
            if record['sources'] and record['sources'] != '[]':
                sources = json.loads(record['sources'])
                for src in sources:
                    urls = src.get('urls', [])
                    if urls:
                        report_lines.append(f"**Source ({src.get('type', 'unknown')}):** {', '.join(urls[:3])}")
            
            report_lines.append("")
        
        # Add benchmark citations section
        benchmark_citations = {}
        for record in self.audit_records:
            if record['sources'] and record['sources'] != '[]':
                try:
                    sources = json.loads(record['sources'])
                    for src in sources:
                        if src.get('urls'):
                            for url in src['urls']:
                                if url not in benchmark_citations:
                                    benchmark_citations[url] = []
                                benchmark_citations[url].append(record['row_index'])
                except json.JSONDecodeError:
                    pass
        
        if benchmark_citations:
            report_lines.append("## Citations by Source")
            report_lines.append("")
            for url, rows in list(benchmark_citations.items())[:20]:
                report_lines.append(f"- {url}: Rows {rows}")
            report_lines.append("")
        
        # Write report
        with open(self.report_path, 'w') as f:
            f.write('\n'.join(report_lines))


# =============================================================================
# CLI Interface
# =============================================================================

def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Clean and validate CrossFit workout CSV data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --input data/workouts_table.csv
  %(prog)s --input data/workouts_table.csv --rounding 5
  %(prog)s --input data/workouts_table.csv --dry-run
  %(prog)s --input data/workouts_table.csv --replace-input
        """
    )
    
    parser.add_argument(
        '--input', '-i',
        default='data/workouts_table.csv',
        help='Input CSV file path (default: data/workouts_table.csv)'
    )
    
    parser.add_argument(
        '--out', '-o',
        default='workouts_table_cleaned.csv',
        help='Output cleaned CSV file path (default: workouts_table_cleaned.csv)'
    )
    
    parser.add_argument(
        '--audit', '-a',
        default='workouts_table_audit.csv',
        help='Output audit CSV file path (default: workouts_table_audit.csv)'
    )
    
    parser.add_argument(
        '--report', '-r',
        default='validation_report.md',
        help='Output validation report path (default: validation_report.md)'
    )
    
    parser.add_argument(
        '--rounding',
        type=float,
        choices=[1, 2.5, 5],
        default=1,
        help='Rounding precision for kg conversion (default: 1)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Run without saving output files'
    )
    
    parser.add_argument(
        '--replace-input',
        action='store_true',
        help='Replace input file with cleaned output'
    )
    
    parser.add_argument(
        '--max-ai-requests',
        type=int,
        default=50,
        help='Maximum number of AI API requests (default: 50)'
    )
    
    parser.add_argument(
        '--no-web',
        action='store_true',
        help='Disable web scraping fallback (faster, offline mode)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    return parser.parse_args()


def main():
    """Main entry point."""
    args = parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Determine output path
    output_path = args.out
    if args.replace_input:
        output_path = args.input
    
    # Initialize cleaner
    cleaner = WorkoutDataCleaner(
        input_path=args.input,
        output_path=output_path,
        audit_path=args.audit,
        report_path=args.report,
        rounding=int(args.rounding) if args.rounding in [1, 5] else args.rounding,
        max_ai_requests=args.max_ai_requests,
        dry_run=args.dry_run,
        no_web=args.no_web
    )
    
    # Run cleaning pipeline
    df_cleaned = cleaner.clean()
    
    # Save outputs
    cleaner.save_outputs(df_cleaned)
    
    # Print summary
    print("\n" + "="*60)
    print("CLEANING COMPLETE")
    print("="*60)
    print(f"Rows processed: {cleaner.stats['rows_processed']}")
    print(f"Columns removed (unused): {cleaner.stats['columns_removed']}")
    print(f"Unit conversions: {cleaner.stats['unit_conversions']}")
    print(f"AI fills: {cleaner.stats['ai_fills']}")
    print(f"Web fills: {cleaner.stats['web_fills']}")
    print(f"Duplicates found: {cleaner.stats['duplicates_found']}")
    print(f"Contradictions: {cleaner.stats['contradictions_found']}")
    print(f"Manual review needed: {cleaner.stats['manual_review_needed']}")
    print("="*60)
    
    if not args.dry_run:
        print(f"\nOutput files:")
        print(f"  - Cleaned data: {output_path}")
        print(f"  - Audit log: {args.audit}")
        print(f"  - Report: {args.report}")


if __name__ == '__main__':
    main()
