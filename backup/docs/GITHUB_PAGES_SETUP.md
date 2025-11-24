# GitHub Pages Custom Subdomain Configuration

This document provides instructions for completing the GitHub Pages configuration to use the custom subdomain **gym.petefox.co.uk**.

## 📁 Repository Configuration

### ✅ Step 1: CNAME File (Completed)
The `CNAME` file has been created at the root of the repository with the following content:
```
gym.petefox.co.uk
```

This file tells GitHub Pages to serve the site at the custom subdomain instead of the default `petexa.github.io` domain.

## 🌐 DNS Configuration (IONOS)

### Step 2: Configure DNS Settings in IONOS

You need to add a CNAME record in your IONOS DNS settings to point your subdomain to GitHub Pages.

1. **Log in to IONOS**
   - Go to [https://www.ionos.com/](https://www.ionos.com/)
   - Sign in to your account

2. **Navigate to DNS Settings**
   - Go to your domains list
   - Select the domain `petefox.co.uk`
   - Click on "DNS" or "DNS Settings"

3. **Add CNAME Record**
   - Click "Add Record" or similar button
   - Select record type: **CNAME**
   - Configure the record with these values:

   | Field | Value |
   |-------|-------|
   | **Host/Name** | `gym` |
   | **Points to/Target** | `petexa.github.io` |
   | **TTL** | 3600 (or default) |

4. **Save the Record**
   - Click "Save" or "Add Record"
   - Wait for DNS propagation (can take 5 minutes to 48 hours, typically 15-30 minutes)

### Example CNAME Record Configuration
```
Type: CNAME
Host: gym
Points to: petexa.github.io
TTL: 3600
```

> **Note**: Do NOT include the full domain in the Host field. IONOS will automatically append `.petefox.co.uk` to create `gym.petefox.co.uk`.

## ⚙️ GitHub Repository Settings

### Step 3: Enable GitHub Pages

1. **Go to Repository Settings**
   - Navigate to [https://github.com/petexa/petexa.github.io](https://github.com/petexa/petexa.github.io)
   - Click on **Settings** (top menu)

2. **Configure GitHub Pages**
   - Scroll down to the **Pages** section (left sidebar)
   - Under "Source":
     - Select branch: **main** (or the branch containing your site)
     - Select folder: **/ (root)**
   - Click **Save**

3. **Verify Custom Domain**
   - The custom domain `gym.petefox.co.uk` should already appear in the "Custom domain" field
   - If not, enter it manually and click **Save**
   - Wait for DNS check to complete (green checkmark)

### Step 4: Enable HTTPS (Recommended)

After DNS propagates and GitHub verifies your domain:

1. In the GitHub Pages settings, you'll see an option:
   - **☑ Enforce HTTPS**
2. Check this box to enable HTTPS
3. GitHub will automatically provision an SSL certificate via Let's Encrypt

> **Important**: HTTPS enforcement may take a few minutes to become available after DNS verification. If the option is grayed out, wait for DNS propagation to complete.

## 🔍 Verification Steps

### Check DNS Propagation

Use these tools to verify your DNS records are propagating:

```bash
# Check CNAME record (command line)
nslookup gym.petefox.co.uk

# or
dig gym.petefox.co.uk CNAME
```

Online tools:
- [https://www.whatsmydns.net/](https://www.whatsmydns.net/)
- [https://dnschecker.org/](https://dnschecker.org/)

### Expected DNS Response
```
gym.petefox.co.uk    CNAME    petexa.github.io
```

### Test Your Site

Once DNS has propagated and GitHub Pages is configured:

1. Visit [https://gym.petefox.co.uk](https://gym.petefox.co.uk)
2. Verify the site loads correctly
3. Check that HTTPS is working (padlock icon in browser)
4. Verify content matches your repository

## ⏱️ Timeline

| Step | Expected Time |
|------|---------------|
| CNAME file commit | Immediate |
| DNS record creation | 5-10 minutes |
| DNS propagation | 15 minutes - 48 hours (typically 30 min) |
| GitHub DNS verification | 1-5 minutes after DNS propagates |
| HTTPS certificate provisioning | 10-30 minutes after DNS verification |

## 🛠️ Troubleshooting

### Issue: "DNS check failed" in GitHub Pages settings

**Solutions:**
- Verify the CNAME record is correctly configured in IONOS
- Ensure you used `gym` as the Host (not `gym.petefox.co.uk`)
- Wait longer for DNS propagation (can take up to 48 hours)
- Clear your local DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (macOS)

### Issue: "HTTPS enforcement" option is grayed out

**Solutions:**
- Wait for DNS verification to complete first
- Ensure DNS propagation is complete
- Try unchecking and re-checking the "Enforce HTTPS" box after a few minutes

### Issue: Site shows 404 error

**Solutions:**
- Verify GitHub Pages is enabled in repository settings
- Confirm the source branch is set correctly (main branch, root folder)
- Check that the CNAME file is in the root of the repository
- Wait a few minutes for GitHub Pages to rebuild the site

### Issue: Old domain still showing

**Solutions:**
- Clear your browser cache
- Try accessing the site in an incognito/private window
- Wait for DNS propagation to complete globally

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Custom Domain Guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [IONOS DNS Management](https://www.ionos.com/help/)

## ✅ Summary

After completing these steps, your GitHub Pages site will be accessible at:
- **Primary URL**: [https://gym.petefox.co.uk](https://gym.petefox.co.uk)
- **Original URL**: [https://petexa.github.io](https://petexa.github.io) (will redirect to custom domain)

Both URLs will work, but the custom domain will be the canonical URL once configured.

---

**Configuration Date**: 2025-11-20  
**Repository**: petexa/petexa.github.io  
**Custom Domain**: gym.petefox.co.uk
