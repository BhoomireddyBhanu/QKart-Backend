# Setup file template to upload data to MongoDB Atlas
mongoimport --uri <add-url-connection-string-here> --drop --collection users --file data/export_qkart_users.json
mongoimport --uri <add-url-connection-string-here> --drop --collection products --file data/export_qkart_products.json