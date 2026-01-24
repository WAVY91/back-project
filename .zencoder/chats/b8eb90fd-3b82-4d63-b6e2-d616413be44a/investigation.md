# Bug Investigation: 404 Not Found on POST /donation/add

## Bug Summary
The frontend attempts to submit donations by sending a POST request to `/donation/add`. However, the backend returns a 404 Not Found error because this endpoint is not defined and the `/donation` path is incorrectly routed.

## Root Cause Analysis
1. **Incorrect Route Mounting**: In `index.js`, the `/donation` path is incorrectly mapped to `donorRoutes` instead of `donationRoutes`.
   ```javascript
   app.use('/donation', donorRoutes) // This should use donationRoutes
   ```
2. **Missing Route Import**: `donationRoutes` is not imported in `index.js`.
3. **Missing Endpoint**: The `donation.routes.js` file defines a `/submit` endpoint but not an `/add` endpoint, which the frontend expects.

## Affected Components
- `index.js`: Needs to import and correctly mount `donation.routes.js`.
- `routes/donation.routes.js`: Needs to define the `/add` endpoint.

## Implementation Notes
- Imported `donationRoutes` in `index.js`.
- Fixed `/donation` route mounting in `index.js`.
- Added `router.post('/add', submitDonation)` to `routes/donation.routes.js`.
- Verified that the `/donation/add` endpoint is now correctly routed to `submitDonation`.

