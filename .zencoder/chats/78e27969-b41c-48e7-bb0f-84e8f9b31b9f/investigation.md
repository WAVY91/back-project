# Bug Investigation - Admin Campaign Management 404

## Bug Summary
The admin dashboard fails to approve, reject, or delete campaigns. The browser console shows 404 Not Found errors for the following endpoints:
- `PATCH /campaign/:id/approve`
- `PATCH /campaign/:id/reject`
- `DELETE /campaign/:id`

## Root Cause Analysis
1. **Missing Routes**: The `routes/campaign.routes.js` file does not define `approve`, `reject`, or `delete` endpoints.
2. **Route Mismatch**: While `routes/admin.routes.js` has `approve` and `reject` routes, they are prefixed with `/admin/campaigns/` instead of `/campaign/` as expected by the frontend.
3. **Missing Implementation**: The `deleteCampaign` controller is not implemented in `controllers/admin.controllers.js`.

## Affected Components
- `routes/campaign.routes.js`: Needs new routes for approve, reject, and delete.
- `controllers/admin.controllers.js`: Needs `deleteCampaign` implementation and export.
- `routes/admin.routes.js`: (Optional) Update to match or keep for redundancy, but `campaign.routes.js` is the primary fix.

## Bug 2: Donation Submission 404

### Bug Summary
The frontend fails to submit donations, receiving a 404 Not Found error for `POST /donation/submit`.

### Root Cause Analysis
The route `/donation/submit` is not defined in the backend. Although a `donateToCampaign` controller exists in `donor.controllers.js` and a corresponding route exists under `/donor/campaigns/:campaignId/donate`, the frontend expects a standalone `/donation/submit` endpoint.

### Affected Components
- `index.js`: Needs to mount the donation router.
- `routes/donation.routes.js`: New file to define the donation submission route.
- `controllers/donation.controllers.js`: New file or extension of existing controllers to handle donation submission.

### Bug 3: Campaign Visibility Workflow

### Bug Summary
Campaigns created by NGOs were defaulting to `pending` status, requiring admin approval before becoming visible to donors.

### Root Cause Analysis
The `createCampaign` controller in `ngo.controllers.js` was explicitly setting the status to `pending`. While this is a standard security measure, the user requested that campaigns be automatically added to the campaign page for immediate donor access.

### Affected Components
- `controllers/ngo.controllers.js`: `createCampaign` function.

### Implementation Notes
- Changed initial campaign status from `pending` to `active` in `controllers/ngo.controllers.js`.
- Verified `getActiveCampaigns` in `donor.controllers.js` correctly fetches all `active` campaigns.
- Verified `submitDonation` in `donation.controllers.js` handles successful donations for these active campaigns.
