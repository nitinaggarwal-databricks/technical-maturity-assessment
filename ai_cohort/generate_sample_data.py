"""
Generate sample data for the analytical agent
Creates realistic e-commerce sales data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

# Generate sample sales data
def generate_sales_data(n_records=1000):
    """Generate sample sales transaction data"""
    
    # Define data parameters
    products = [
        ('PROD001', 'Laptop Pro 15"', 'Electronics', 1299.99),
        ('PROD002', 'Wireless Mouse', 'Electronics', 29.99),
        ('PROD003', 'USB-C Cable', 'Accessories', 19.99),
        ('PROD004', 'Monitor 27"', 'Electronics', 399.99),
        ('PROD005', 'Keyboard Mechanical', 'Electronics', 149.99),
        ('PROD006', 'Desk Chair', 'Furniture', 249.99),
        ('PROD007', 'Standing Desk', 'Furniture', 599.99),
        ('PROD008', 'Webcam HD', 'Electronics', 79.99),
        ('PROD009', 'Headphones', 'Electronics', 199.99),
        ('PROD010', 'Phone Case', 'Accessories', 24.99),
        ('PROD011', 'Tablet 10"', 'Electronics', 449.99),
        ('PROD012', 'Smart Watch', 'Electronics', 299.99),
        ('PROD013', 'Backpack', 'Accessories', 89.99),
        ('PROD014', 'Desk Lamp', 'Furniture', 59.99),
        ('PROD015', 'Cable Organizer', 'Accessories', 14.99),
    ]
    
    regions = ['North', 'South', 'East', 'West', 'Central']
    customer_segments = ['Enterprise', 'Small Business', 'Individual', 'Education']
    
    # Generate dates for 2023
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2023, 12, 31)
    date_range = (end_date - start_date).days
    
    # Generate records
    records = []
    for i in range(n_records):
        product = random.choice(products)
        quantity = np.random.choice([1, 1, 1, 2, 2, 3], p=[0.5, 0.2, 0.1, 0.1, 0.05, 0.05])
        
        # Add some seasonal variation (higher sales in Q4)
        days_offset = random.randint(0, date_range)
        order_date = start_date + timedelta(days=days_offset)
        month = order_date.month
        
        # Q4 boost
        if month >= 10:
            if random.random() < 0.3:  # 30% chance of higher quantity in Q4
                quantity += 1
        
        revenue = product[3] * quantity
        
        record = {
            'order_id': f'ORD{10000 + i}',
            'order_date': order_date.strftime('%Y-%m-%d'),
            'product_id': product[0],
            'product_name': product[1],
            'category': product[2],
            'price': product[3],
            'quantity': quantity,
            'revenue': round(revenue, 2),
            'customer_id': f'CUST{random.randint(1000, 5000)}',
            'customer_segment': random.choice(customer_segments),
            'region': random.choice(regions),
        }
        records.append(record)
    
    return pd.DataFrame(records)

def generate_customer_data():
    """Generate sample customer data"""
    customers = []
    for i in range(1000, 5001):
        customers.append({
            'customer_id': f'CUST{i}',
            'customer_name': f'Customer {i}',
            'segment': random.choice(['Enterprise', 'Small Business', 'Individual', 'Education']),
            'region': random.choice(['North', 'South', 'East', 'West', 'Central']),
            'account_created': (datetime(2020, 1, 1) + timedelta(days=random.randint(0, 1095))).strftime('%Y-%m-%d'),
        })
    return pd.DataFrame(customers)

def generate_product_catalog():
    """Generate product catalog data"""
    products = [
        ('PROD001', 'Laptop Pro 15"', 'Electronics', 1299.99, 4.5, 150),
        ('PROD002', 'Wireless Mouse', 'Electronics', 29.99, 4.2, 500),
        ('PROD003', 'USB-C Cable', 'Accessories', 19.99, 4.0, 1000),
        ('PROD004', 'Monitor 27"', 'Electronics', 399.99, 4.6, 200),
        ('PROD005', 'Keyboard Mechanical', 'Electronics', 149.99, 4.4, 300),
        ('PROD006', 'Desk Chair', 'Furniture', 249.99, 4.3, 100),
        ('PROD007', 'Standing Desk', 'Furniture', 599.99, 4.7, 75),
        ('PROD008', 'Webcam HD', 'Electronics', 79.99, 4.1, 250),
        ('PROD009', 'Headphones', 'Electronics', 199.99, 4.5, 400),
        ('PROD010', 'Phone Case', 'Accessories', 24.99, 3.9, 800),
        ('PROD011', 'Tablet 10"', 'Electronics', 449.99, 4.4, 150),
        ('PROD012', 'Smart Watch', 'Electronics', 299.99, 4.3, 200),
        ('PROD013', 'Backpack', 'Accessories', 89.99, 4.2, 300),
        ('PROD014', 'Desk Lamp', 'Furniture', 59.99, 4.0, 400),
        ('PROD015', 'Cable Organizer', 'Accessories', 14.99, 3.8, 600),
    ]
    
    df = pd.DataFrame(products, columns=['product_id', 'product_name', 'category', 'price', 'rating', 'stock'])
    return df

def main():
    """Generate all sample data files"""
    print("Generating sample data...")
    
    # Create data directory
    import os
    os.makedirs('data', exist_ok=True)
    
    # Generate and save sales data
    print("Generating sales data...")
    sales_df = generate_sales_data(1000)
    sales_df.to_csv('data/sales_transactions.csv', index=False)
    print(f"✓ Created sales_transactions.csv ({len(sales_df)} records)")
    
    # Generate and save customer data
    print("Generating customer data...")
    customers_df = generate_customer_data()
    customers_df.to_csv('data/customers.csv', index=False)
    print(f"✓ Created customers.csv ({len(customers_df)} records)")
    
    # Generate and save product catalog
    print("Generating product catalog...")
    products_df = generate_product_catalog()
    products_df.to_csv('data/products.csv', index=False)
    print(f"✓ Created products.csv ({len(products_df)} records)")
    
    # Print summary statistics
    print("\nData Summary:")
    print(f"Total Revenue: ${sales_df['revenue'].sum():,.2f}")
    print(f"Average Order Value: ${sales_df['revenue'].mean():.2f}")
    print(f"Total Orders: {len(sales_df)}")
    print(f"Unique Customers: {sales_df['customer_id'].nunique()}")
    print(f"Date Range: {sales_df['order_date'].min()} to {sales_df['order_date'].max()}")
    
    print("\nTop 5 Products by Revenue:")
    top_products = sales_df.groupby('product_name')['revenue'].sum().sort_values(ascending=False).head()
    for product, revenue in top_products.items():
        print(f"  {product}: ${revenue:,.2f}")

if __name__ == "__main__":
    main()

