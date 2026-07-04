import FormData from 'form-data';
import fetch from 'node-fetch';

const formData = new FormData();
formData.append('name', 'Test User');
formData.append('email', 'test@example.com');
formData.append('phone', '+1234567890');
formData.append('business', 'Test Business');
formData.append('message', 'This is a test message to verify email functionality.');

const response = await fetch('http://localhost:3000/', {
  method: 'POST',
  body: formData,
  headers: formData.getHeaders(),
});

const html = await response.text();
console.log('Response status:', response.status);
console.log('[v0] Form submission test completed');
