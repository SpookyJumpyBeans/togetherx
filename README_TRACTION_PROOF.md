# Traction Proof Images - Database Migration Required

## What Changed

Added support for traction metric proof images. When users submit products with traction metrics (Users/DAU/MAU, Revenue, or Growth Rate), they are now required to upload proof screenshots.

## Required Database Migration

**IMPORTANT:** You must run the following SQL in your Supabase SQL Editor:

```sql
-- Add traction proof screenshot columns
alter table public.products 
add column if not exists users_screenshot_url text,
add column if not exists revenue_screenshot_url text,
add column if not exists growth_screenshot_url text;
```

## Features

1. **Submission Form**: Users must upload proof images when they enter traction metrics
2. **Edit Product**: Users must upload proof images when editing products with traction metrics
3. **Form Persistence**: All form data including uploaded files is saved to IndexedDB if user needs to sign in
4. **Approval Page**: Admins can view traction proof images when reviewing products
5. **Home Page**: Traction proof images are NOT shown on the home page for approved products (security/privacy)

## Where Proof Images Show

- ✅ **Approval Page**: Product detail dialog shows all proof images
- ✅ **Rejected Products Page**: Product detail dialog shows all proof images
- ❌ **Home Page**: Proof images are hidden from public view
