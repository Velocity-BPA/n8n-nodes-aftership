# n8n-nodes-aftership

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node that integrates with AfterShip's shipment tracking platform. This node provides access to 5 core resources enabling comprehensive package tracking, courier management, checkpoint monitoring, notification handling, and webhook configuration for automated shipping workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Shipment Tracking](https://img.shields.io/badge/Shipment-Tracking-orange)
![Logistics](https://img.shields.io/badge/Logistics-API-green)
![E-commerce](https://img.shields.io/badge/E--commerce-Integration-purple)

## Features

- **Shipment Tracking** - Create, update, and monitor package deliveries across 1000+ couriers worldwide
- **Courier Management** - Access comprehensive courier information and service capabilities
- **Checkpoint Analysis** - Retrieve detailed delivery milestones and transit history
- **Smart Notifications** - Configure and manage delivery status alerts for customers
- **Webhook Integration** - Set up real-time tracking event notifications for automated workflows
- **Global Coverage** - Support for international shipping with multi-language tracking
- **Delivery Analytics** - Access performance metrics and delivery insights
- **Custom Fields** - Add metadata and custom tracking parameters to shipments

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-aftership`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-aftership
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-aftership.git
cd n8n-nodes-aftership
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aftership
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your AfterShip API key from dashboard settings | Yes |
| API Environment | Production or Sandbox environment | Yes |

## Resources & Operations

### 1. Tracking

| Operation | Description |
|-----------|-------------|
| Create | Add a new shipment to track with tracking number and courier |
| Get | Retrieve tracking information for a specific shipment |
| Update | Modify shipment details, add custom fields, or update delivery info |
| Delete | Remove a shipment from tracking |
| List | Get all tracked shipments with optional filtering |
| Get Last Checkpoint | Retrieve the most recent tracking event |
| Retrack | Reactivate tracking for expired or inactive shipments |

### 2. Courier

| Operation | Description |
|-----------|-------------|
| List All | Get complete list of supported courier services |
| Get | Retrieve detailed information about a specific courier |
| Detect | Automatically identify courier from tracking number format |
| List User Couriers | Get couriers available to your account |

### 3. Checkpoint

| Operation | Description |
|-----------|-------------|
| Get | Retrieve all checkpoint events for a tracked shipment |
| List | Get checkpoint history with filtering options |

### 4. Notification

| Operation | Description |
|-----------|-------------|
| Create | Set up delivery notifications for customers |
| Get | Retrieve notification settings for a shipment |
| Update | Modify notification preferences and recipients |
| Delete | Remove notification configuration |
| List | Get all configured notifications |

### 5. Webhook

| Operation | Description |
|-----------|-------------|
| Create | Configure webhook endpoints for tracking events |
| Get | Retrieve webhook configuration details |
| Update | Modify webhook URL and event triggers |
| Delete | Remove webhook configuration |
| List | Get all configured webhooks |
| Test | Send test webhook payload to verify endpoint |

## Usage Examples

```javascript
// Create a new shipment tracking
{
  "tracking_number": "1Z999AA1234567890",
  "slug": "ups",
  "title": "iPhone Order #12345",
  "customer_name": "John Smith",
  "order_id": "ORD-12345",
  "custom_fields": {
    "product_name": "iPhone 14 Pro",
    "order_value": "$999.00"
  }
}
```

```javascript
// Set up delivery notifications
{
  "tracking_id": "aftership_tracking_id",
  "emails": ["customer@example.com", "support@store.com"],
  "smses": ["+1234567890"],
  "notification_preference": {
    "email": ["Delivered", "Exception", "Delivered"],
    "sms": ["Exception", "Delivered"]
  }
}
```

```javascript
// Configure webhook for order management system
{
  "url": "https://yourstore.com/api/webhooks/aftership",
  "events": ["tracking.delivered", "tracking.exception", "tracking.expired"],
  "secret": "your_webhook_secret_key"
}
```

```javascript
// Query shipments with filters
{
  "slug": "fedex",
  "delivery_time": "2024-01-15,2024-01-31",
  "status": "Delivered",
  "fields": "tracking_number,tag,checkpoints",
  "limit": 50
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid or missing API key | Verify API key in credentials configuration |
| 4001 Tracking Already Exists | Attempting to create duplicate tracking | Use update operation or check existing trackings first |
| 4004 Tracking Not Found | Shipment doesn't exist in system | Verify tracking number and courier selection |
| 4010 Invalid Tracking Number | Malformed or invalid tracking format | Validate tracking number format for selected courier |
| 4020 Courier Not Supported | Selected courier not available | Use courier detection or check supported courier list |
| 429 Rate Limited | API rate limit exceeded | Implement delays between requests or upgrade plan |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
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
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-aftership/issues)
- **AfterShip API Documentation**: [docs.aftership.com](https://docs.aftership.com)
- **AfterShip Developer Community**: [community.aftership.com](https://community.aftership.com)