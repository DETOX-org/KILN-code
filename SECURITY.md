# Security Policy

The DETOX Code team takes security vulnerabilities seriously. We appreciate the efforts of security researchers and community members who report security concerns responsibly.

---

## Reporting a Vulnerability

> [!IMPORTANT]
> **Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability or potential threat in DETOX Code, please report it privately:

1. **Email Contact**: Send details to `security@detox-code.org` (or contact project maintainers privately via GitHub Advisory / direct security contacts).
2. **Details to Include**:
   - Description of the vulnerability and its potential impact
   - Step-by-step instructions or proof-of-concept to reproduce the issue
   - Affected components (e.g. Online Judge isolation, submission pipeline, API endpoints)
   - Any proposed mitigations or fixes, if available

---

## Response Expectations

- **Acknowledgment**: We aim to acknowledge receipt of your vulnerability report within 48 hours.
- **Assessment**: The maintainers will investigate and validate the vulnerability within 5 business days.
- **Updates**: We will keep you updated on progress towards resolving the issue.
- **Disclosure**: Once a fix is prepared and verified, we will coordinate public disclosure and acknowledge your contribution (unless you request to remain anonymous).

---

## Scope and Considerations

As DETOX Code is currently in its early setup phase, security considerations primarily focus on:
- Secure isolation for the future Online Judge sandbox environment (e.g., preventing remote code execution or host escapes)
- API authentication and authorization mechanisms
- Input validation for challenge submissions
- Repository and CI pipeline security

Thank you for helping keep DETOX Code and its community safe!
