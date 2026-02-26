const services = [
  {
    id: 1,
    title: "Web Development",
    description:
      "Custom web applications built with modern technologies. From simple websites to complex web platforms.",
    icon: "🌐",
  },
  {
    id: 2,
    title: "Mobile App Development",
    description:
      "Native and cross-platform mobile apps for iOS and Android. Beautiful, performant, and user-friendly.",
    icon: "📱",
  },
  {
    id: 3,
    title: "UI/UX Design",
    description:
      "User-centered design that converts visitors into customers. Clean, modern, and intuitive interfaces.",
    icon: "🎨",
  },
  {
    id: 4,
    title: "API Development",
    description:
      "Robust and scalable APIs and backend services. RESTful and GraphQL APIs tailored to your needs.",
    icon: "⚡",
  },
];

export function Services() {
  return (
    <section id="services" className="services">
      <div className="container">
        <h2>What We Do</h2>
        <p className="section-subtitle">
          We offer end-to-end digital product development services
        </p>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <span className="service-icon">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
