# The Bell Homepage Prototype

An Angular prototype of The Bell’s homepage with a layout editor and a simulated subscription checkout.

## Run locally

```bash
npm install
npm start
```

Open the [homepage](http://localhost:4200), [layout editor](http://localhost:4200/#constructor), or [checkout demo](http://localhost:4200/?checkout=unlimited&price=year).

## Checkout

- Product and plan selection, synced with the URL in [checkout.service.ts](src/app/checkout/checkout.service.ts).
- Form validation and simulated payment in [checkout-dialog.ts](src/app/checkout/checkout-dialog.ts).
- Product dropdown in [product-picker.ts](src/app/checkout/product-picker.ts).
