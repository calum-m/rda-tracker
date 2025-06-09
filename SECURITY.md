# Security Policy

## Supported Versions

This project is a web application. Security updates and patches are applied to the latest version of the application deployed from the `main` branch. We do not offer security support for previous states or forks of the repository.

| Version                 | Supported          |
| ----------------------- | ------------------ |
| Latest (main branch)    | :white_check_mark: |
| Previous commits/states | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, we appreciate your help in disclosing it to us responsibly.

**How to Report a Vulnerability:**

1.  **Do NOT report security vulnerabilities through public GitHub issues.**
2.  Please report vulnerabilities by creating a **confidential issue** if your GitHub plan and repository settings support this feature for public repositories.
3.  Alternatively, if confidential issues are not available or you are unsure, please email the repository owner directly (if a contact email is listed in the repository or user profile).
4.  If direct private reporting is not immediately clear or available, you may create a regular GitHub issue but please title it clearly as "Security Vulnerability Report - [Brief Description]" and avoid including full exploit details in the initial public report. We will then contact you for more details privately.

**What to Include in Your Report:**

Please include the following details in your report:

*   A clear description of the vulnerability.
*   Steps to reproduce the vulnerability, including any specific URLs, parameters, or configurations.
*   The potential impact of the vulnerability.
*   Any proof-of-concept code or screenshots, if applicable.

**Our Commitment:**

*   We will acknowledge receipt of your vulnerability report within 48-72 hours.
*   We will investigate the reported vulnerability and aim to provide an update on our findings within 7-10 business days.
*   We will work to remediate accepted vulnerabilities in a timely manner.
*   We will notify you when the vulnerability has been fixed.
*   We kindly ask that you do not publicly disclose the vulnerability until we have had a reasonable amount of time to address it.

We appreciate your efforts to keep RDA Tracker secure.

## Known Vulnerabilities

### Transitive Dependencies

As of June 2025, `npm audit` reports the following moderate severity vulnerabilities related to `webpack-dev-server`, which is a transitive dependency of `react-scripts@5.0.1` (a core component of Create React App):

*   **`webpack-dev-server` <=5.2.0**
    *   **GHSA-9jgg-88mc-972h (Moderate):** "webpack-dev-server users' source code may be stolen when they access a malicious web site with non-Chromium based browser"
    *   **GHSA-4v9v-hfq4-rm2v (Moderate):** "webpack-dev-server users' source code may be stolen when they access a malicious web site"

**Status:**
These vulnerabilities are associated with the development server (`webpack-dev-server`) and pose a risk primarily to the development environment if a developer accesses a malicious website while the development server is running. They do not affect the production build of the application served to end-users.

`react-scripts` has not yet released an update that incorporates a patched version of `webpack-dev-server`. Attempting to force an override for `webpack-dev-server` is considered high risk, as `npm audit fix --force` indicates this would be a breaking change for `react-scripts` (potentially downgrading it to version 0.0.0).

**Mitigation/Action:**
We are currently monitoring `react-scripts` for an update that addresses these transitive dependencies. Until such an update is available, we acknowledge this development-time risk. Developers should exercise caution and ensure they are using up-to-date browsers with security features enabled when running the local development server.

Overrides for other vulnerabilities (e.g., `nth-check`, `postcss`) have been applied where safe to do so.
