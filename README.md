

# TIKITI Ticketing System

TIKITI is a ticketing system that allows users to purchase event tickets and receive a confirmation email with a unique QR code for each ticket.

## Installation

To install and run the TIKITI Ticketing System, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/njourou/ticketsystem
    ```

2. Navigate to the project directory:

    ```bash
    cd ticketsystem
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Create a `.env` file in the project root directory and add the configurationin .envexample:


    Replace  with your SMTP server credentials. This is required for sending confirmation emails.

## Usage

To run the TIKITI Ticketing System, use the following command:

```bash
npx nodemon or npm start
```




## Endpoints

- `/ussd`: Endpoint for handling USSD requests.

## Contributing

Contributions are welcome! If you'd like to contribute to the TIKITI Ticketing System, please follow these guidelines:

1. Fork the repository
2. Create a new branch (`git checkout -b feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature`)
6. Create a new Pull Request

## License

This project is licensed under the MIT License
