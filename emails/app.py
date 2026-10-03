
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from typing import Optional

app = Flask(__name__)


def send_email(
    sender_email: str,
    sender_password: str,
    recipient_email: str,
    subject: str,
    body: str,
    smtp_server: str = "smtp.gmail.com",
    smtp_port: int = 587
) -> bool:
    """
    Send an email using SMTP.
    Args:
        sender_email: The email address of the sender
        sender_password: The password or app-specific password for the sender's email
        recipient_email: The email address of the recipient
        subject: The subject line of the email
        body: The body text of the email
        smtp_server: SMTP server address (default is Gmail's SMTP server)
        smtp_port: SMTP server port (default is 587 for TLS)
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Create the email message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = recipient_email
        message["Subject"] = subject

        # Add body to email
        message.attach(MIMEText(body, "html"))  # Changed to HTML

        # Create SMTP session
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            # Start TLS for security
            server.starttls()

            # Login to the server
            server.login(sender_email, sender_password)

            # Send email
            server.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


def replace_template_variables(html_content: str, replacements: dict) -> str:
    """
    Replace template variables in HTML content using double curly braces.

    Args:
        html_content (str): Original HTML template
        replacements (dict): Dictionary of variable replacements

    Returns:
        str: HTML content with variables replaced
    """
    # Replace each key in the replacements dictionary
    for key, value in replacements.items():
        # Use double curly braces for template variables
        html_content = html_content.replace('{{' + key + '}}', str(value))

    return html_content


@app.route('/send-email', methods=['POST'])
def api_send_email():
    """
    API endpoint to send an email.
    Expects JSON with the following fields:
    - recipient: recipient email address
    - subject: email subject
    - html_file: path to HTML file to use as email body
    """
    try:
        # Get request data
        data = request.json

        # Validate required fields
        if not all(key in data for key in ['recipient', 'subject', 'html_file']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields. Need recipient, subject, and html_file'
            }), 400

        # Read HTML file
        try:
            with open(data['html_file'], 'r') as file:
                html_body = file.read()
        except FileNotFoundError:
            return jsonify({
                'success': False,
                'message': f"HTML file not found: {data['html_file']}"
            }), 404
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f"Error reading HTML file: {str(e)}"
            }), 500

        # Apply template replacements if provided
        replacements = data.get('replacements', {})
        html_body = replace_template_variables(html_body, replacements)

        # Send email
        sender_email = os.environ.get('SENDER_EMAIL', '')
        sender_password = os.environ.get('SENDER_PASSWORD', '')

        if not sender_password:
            return jsonify({
                'success': False,
                'message': 'Sender email credentials not configured'
            }), 500

        success = send_email(
            sender_email=sender_email,
            sender_password=sender_password,
            recipient_email=data['recipient'],
            subject=data['subject'],
            body=html_body,
            smtp_server='smtp.gmail.com'
        )

        # Return response
        return jsonify({
            'success': success,
            'message': 'Email sent successfully' if success else 'Failed to send email'
        }), 200 if success else 500

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Unexpected error: {str(e)}"
        }), 500


if __name__ == '__main__':
    # Ensure environment variables are set
    if not os.environ.get('SENDER_EMAIL') or not os.environ.get('SENDER_PASSWORD'):
        print("Warning: SENDER_EMAIL or SENDER_PASSWORD environment variables not set")

    # Run the Flask app
    app.run(debug=False, host='0.0.0.0', port=6000)
