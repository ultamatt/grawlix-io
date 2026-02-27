import { Globe, Palette, Smartphone, Zap } from "lucide-react";

const services = [
  {
    id: 1,
    title: "Web Development",
    description:
      "Custom web applications built with modern technologies. From simple websites to complex web platforms.",
    Icon: Globe,
  },
  {
    id: 2,
    title: "Mobile App Development",
    description:
      "Native and cross-platform mobile apps for iOS and Android. Beautiful, performant, and user-friendly.",
    Icon: Smartphone,
  },
  {
    id: 3,
    title: "UI/UX Design",
    description:
      "User-centered design that converts visitors into customers. Clean, modern, and intuitive interfaces.",
    Icon: Palette,
  },
  {
    id: 4,
    title: "API Development",
    description:
      "Robust and scalable APIs and backend services. RESTful and GraphQL APIs tailored to your needs.",
    Icon: Zap,
  },
];

export function Services() {
  return (
    <section id="services" className="services">
      <div className="container">
        <h2>What We Do</h2>
        <p className="section-subtitle">We offer end-to-end digital product development services</p>
        <div className="services-grid">
          {services.map(({ id, title, description, Icon }) => (
            <div key={id} className="service-card">
              <Icon className="service-icon" aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
