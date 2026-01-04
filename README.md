# n8n-nodes-aftership

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for AfterShip, the industry-leading shipment tracking API platform supporting 1,100+ carriers worldwide. This node provides complete integration with AfterShip's Tracking, Shipping, and Returns APIs.

![n8n](https://img.shields.io/badge/n8n-community--node-brightgreen)
![AfterShip](https://img.shields.io/badge/AfterShip-API-orange)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## Features

- **Shipment Tracking**: Track packages across 1,100+ carriers worldwide with normalized status updates
- **Courier Management**: Access and auto-detect couriers for tracking numbers
- **AI-Powered EDD**: Get estimated delivery dates using AfterShip's machine learning predictions
- **Shipping Labels**: Create, manage, and cancel shipping labels with rate shopping
- **Returns Management**: Handle customer return requests with automated label generation
- **Order Management**: Sync and manage e-commerce orders
- **Real-time Webhooks**: Receive instant notifications for tracking status changes
- **Batch Operations**: Bulk create trackings and get estimated delivery dates

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-aftership`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-aftership

# Restart n8n
```

### Development Installation

```bash
# Clone or extract the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-aftership.git
cd n8n-nodes-aftership

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink for n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aftership

# Restart n8n
```

## Credentials Setup

### AfterShip API Credentials

| Field | Description | Default |
|-------|-------------|---------|
| **API Key** | Your AfterShip API key from the dashboard | Required |
| **API Version** | API version to use | `2025-01` |
| **Base URL** | AfterShip API base URL | `https://api.aftership.com` |

To obtain your API key:
1. Log in to [AfterShip](https://admin.aftership.com/)
2. Go to **Settings** → **API Keys**
3. Create or copy your API key

## Resources & Operations

### Trackings

| Operation | Description |
|-----------|-------------|
| **List** | List all trackings with filters |
| **Get** | Get tracking by ID or slug/number |
| **Create** | Create a new tracking |
| **Update** | Update tracking information |
| **Delete** | Delete a tracking |
| **Retrack** | Retrack an expired tracking |
| **Mark as Completed** | Mark tracking as complete |
| **Get Last Checkpoint** | Get the latest checkpoint |
| **Batch Create** | Create multiple trackings |
| **Detect Courier** | Auto-detect courier for tracking number |

### Couriers

| Operation | Description |
|-----------|-------------|
| **List** | List activated couriers |
| **List All** | List all 1,100+ supported couriers |
| **Detect** | Detect possible couriers for tracking number |
| **Get by Slug** | Get courier details by slug |

### Estimated Delivery

| Operation | Description |
|-----------|-------------|
| **Get** | Get EDD for a single tracking |
| **Batch Get** | Get EDD for multiple trackings |

### Notifications

| Operation | Description |
|-----------|-------------|
| **Get Settings** | Get notification settings for tracking |
| **Add Receiver** | Add email/SMS notification receiver |
| **Remove Receiver** | Remove notification receiver |

### Labels (Shipping API)

| Operation | Description |
|-----------|-------------|
| **Create** | Create a shipping label |
| **Get** | Get label by ID |
| **Cancel** | Cancel/void a label |
| **Get Rates** | Get shipping rates from carriers |
| **Create Manifest** | Create carrier pickup manifest |
| **Get Manifest** | Get manifest by ID |

### Shipments

| Operation | Description |
|-----------|-------------|
| **Create** | Create a shipment |
| **Get** | Get shipment by ID |
| **List** | List shipments |

### Carriers

| Operation | Description |
|-----------|-------------|
| **List** | List shipper accounts |
| **Create** | Add new carrier account |
| **Get** | Get shipper account details |
| **Update** | Update shipper account |
| **Delete** | Remove shipper account |

### Returns

| Operation | Description |
|-----------|-------------|
| **List** | List return requests |
| **Get** | Get return by ID |
| **Create** | Create return request |
| **Update** | Update return request |
| **Get Labels** | Get return labels |
| **Create Label** | Generate return label |

### Return Settings

| Operation | Description |
|-----------|-------------|
| **Get Settings** | Get returns configuration |
| **Update Settings** | Update returns configuration |
| **List Reasons** | Get return reasons |
| **Create Reason** | Add new return reason |

### Orders

| Operation | Description |
|-----------|-------------|
| **List** | List orders |
| **Get** | Get order by ID |
| **Create** | Create order |
| **Update** | Update order |
| **Delete** | Delete order |

### Exports

| Operation | Description |
|-----------|-------------|
| **Create** | Create data export |
| **Get** | Get export status |
| **Download** | Download export file |

### Checkpoints

| Operation | Description |
|-----------|-------------|
| **Get** | Get all checkpoints for a tracking |

## Trigger Node

The AfterShip Trigger node provides webhook-based triggers for real-time tracking updates.

### Events

| Event | Description |
|-------|-------------|
| **Tracking Update** | Any tracking status change |
| **Out for Delivery** | Package is out for delivery |
| **Delivered** | Package successfully delivered |
| **Exception** | Delivery exception occurred |
| **Expired** | Tracking has expired |
| **Pending Pickup** | Package awaiting pickup |
| **In Transit** | Package in transit update |
| **Available for Pickup** | Ready for customer pickup |
| **Return to Sender** | Package being returned |
| **Failed Attempt** | Delivery attempt failed |

### Webhook Security

The trigger node supports HMAC-SHA256 signature verification for webhook security. Configure your webhook secret in AfterShip dashboard and the trigger node settings.

## Usage Examples

### Create and Track a Shipment

```javascript
// 1. Create a tracking
{
  "tracking_number": "1Z999AA10123456784",
  "slug": "ups",
  "title": "Order #12345",
  "customer_name": "John Doe",
  "emails": ["john@example.com"],
  "smses": ["+1234567890"]
}

// 2. Get tracking updates
// Use the tracking ID or slug + number to retrieve status
```

### Batch Create Trackings

```javascript
// Create multiple trackings at once
{
  "trackings": [
    { "tracking_number": "1Z999AA10123456784", "slug": "ups" },
    { "tracking_number": "9400111899223456789012", "slug": "usps" },
    { "tracking_number": "794644790138", "slug": "fedex" }
  ]
}
```

### Generate Shipping Label

```javascript
// Create a shipping label with rate shopping
{
  "shipper_account_id": "your-account-id",
  "ship_from": {
    "name": "Sender Name",
    "street1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "ship_to": {
    "name": "Recipient Name",
    "street1": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "postal_code": "90001",
    "country": "US"
  },
  "parcels": [
    {
      "weight": { "value": 2.5, "unit": "lb" },
      "dimension": { "length": 10, "width": 8, "height": 6, "unit": "in" }
    }
  ]
}
```

## AfterShip Concepts

| Concept | Description |
|---------|-------------|
| **Tracking Number** | Carrier-assigned package identifier |
| **Slug** | Carrier identifier (e.g., `fedex`, `ups`, `dhl`) |
| **Checkpoint** | Individual tracking event with timestamp and location |
| **Tag** | Normalized delivery status (Delivered, InTransit, etc.) |
| **Subtag** | Detailed status code for granular tracking |
| **EDD** | Estimated Delivery Date from AI predictions |
| **Courier Connection ID** | ID for multi-account carrier setups |

## Delivery Statuses

| Status | Description |
|--------|-------------|
| **Pending** | Tracking created, awaiting carrier update |
| **InfoReceived** | Carrier has received shipment info |
| **InTransit** | Package is in transit |
| **OutForDelivery** | Package is out for delivery |
| **AttemptFail** | Delivery attempt was unsuccessful |
| **Delivered** | Package successfully delivered |
| **AvailableForPickup** | Package ready for customer pickup |
| **Exception** | Delivery exception occurred |
| **Expired** | Tracking has expired (no updates for 30+ days) |

## Error Handling

The node provides detailed error messages for common scenarios:

| Error Code | Description |
|------------|-------------|
| **4001** | Invalid API key |
| **4003** | Tracking not found |
| **4004** | Tracking already exists |
| **4005** | Invalid tracking number format |
| **4006** | Courier not detected |
| **4015** | Invalid field value |
| **4021** | Rate limit exceeded |

## Security Best Practices

1. **API Key Security**: Store API keys in n8n credentials, never hardcode
2. **Webhook Verification**: Always enable HMAC signature verification for triggers
3. **Access Control**: Use appropriate n8n user permissions
4. **Data Privacy**: Be mindful of customer PII in tracking data

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [AfterShip API Docs](https://www.aftership.com/docs/tracking/overview)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-aftership/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [AfterShip](https://www.aftership.com/) for their comprehensive tracking API
- [n8n](https://n8n.io/) for the workflow automation platform
- The n8n community for their contributions and feedback
