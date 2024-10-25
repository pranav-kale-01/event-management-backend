# Campus Navigator Backend

This repository contains the backend code for the Campus Navigator application, which provides an API to manage campus locations and events.

## Requirements

- Node.js (version 14 or higher)
- MongoDB (or any other database you prefer)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install the dependencies:
  
    ```bash
      npm install
    ```

2. Set up your environment variables in a .env file:
    
    Paste the .env file in the location as shown in the below image 
    
    ![image](https://github.com/user-attachments/assets/cb0dd432-717b-417d-9cf6-2c848eb337be)
    
3. Start the server:

  ```bash
    node server.js
  ```

This will start the server on http://localhost:3001 (or any port specified in your environment variables).

## API Endpoints

* GET /api/locations: Fetch all campus locations.
* GET /api/locations/ : Get details of a specific location by ID.
* GET /api/locations/search: Search for locations by query parameter.
* PUT /api/edit_event/ : Edit an existing event by ID.

## Testing

You can run tests using:

```bash
  npm run test
```

## License

This project is licensed under the MIT License.
