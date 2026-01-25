# Investigation: Campaign Update Bug (404 Not Found)

## Bug Summary
When attempting to update a campaign from the NGO dashboard, the frontend sends a `PATCH` request to `https://back-project-r1ur.onrender.com/campaign/:campaignId`, which returns a `404 Not Found` error.

## Root Cause Analysis
The backend does not have a route handler defined for `PATCH /campaign/:campaignId`. Additionally, the `updateCampaign` controller function is missing from `controllers/ngo.controllers.js`.

## Affected Components
- `routes/campaign.routes.js`: Needs a new `PATCH` route.
- `controllers/ngo.controllers.js`: Needs a new `updateCampaign` function.

## Implementation Notes
- Added `updateCampaign` controller in `controllers/ngo.controllers.js`.
- Added `PATCH /:campaignId` route in `routes/campaign.routes.js`.
- Verified with manual test using `curl` against a running server.

## Test Results
`PATCH /campaign/6970dec1053258423029f24d` returned:
```json
{
  "success": true,
  "message": "Campaign updated successfully!",
  "data": { ... }
}
```
