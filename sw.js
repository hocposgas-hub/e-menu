self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: "HOC POS",
      body: event.data?.text() || "มีออเดอร์ใหม่"
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "HOC POS", {
      body: data.body || "มีออเดอร์ใหม่",
      tag: data.tag || "hoc-pos",
      data: {
        url: data.url || "/e-menu/?page=kds"
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || "/e-menu/?page=kds",
    self.location.origin
  );

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(async (windows) => {
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin)) {
          await client.navigate(target.href);
          return client.focus();
        }
      }

      return clients.openWindow(target.href);
    })
  );
});
