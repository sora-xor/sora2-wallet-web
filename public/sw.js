self.addEventListener('push', (event) => {
  console.log('Hello from ServiceWorkder', event);
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: 'Notified successfuly',
    })
  );
});
