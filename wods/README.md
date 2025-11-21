# wods Directory - Legacy Files

## Status: ORPHANED / NOT IN USE

This directory contains a legacy CSV file that is **not currently referenced** by any active code in the repository.

## Files:
- `wods-table.csv` (86KB) - Legacy workout data in CSV format

## Context:
- The active WOD (Workout of the Day) system is in the `/WOD/` directory
- The `/WOD/` directory contains Python-based validation and CSV data in `/WOD/data/`
- The `wods-table.html` page does not reference this CSV file
- No other HTML, JavaScript, or Python files reference `wods/wods-table.csv`

## Recommendation:
This directory can likely be removed safely, as:
1. No active code references it
2. The WOD system uses `/WOD/data/` instead
3. The data appears to be duplicated in the WOD system

## Decision:
**KEPT** for now as a potential backup or reference.  
If confirmed unnecessary after review, this entire `wods/` directory can be deleted.

---

*Analysis Date: 2025-11-21*  
*Phase 3 Audit*
