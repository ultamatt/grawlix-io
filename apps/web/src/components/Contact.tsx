import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const getCmsBaseUrl = () => {
    const configured = import.meta.env.PUBLIC_CMS_URL?.trim();
    if (configured) {
      return configured.replace(/\/$/, "");
    }

    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ) {
      return "http://localhost:1337";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "submitting") {
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`${getCmsBaseUrl()}/api/contact-submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            message: formData.message.trim(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("We could not submit your message. Please try again in a moment.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (status === "success") {
    return (
      <section id="contact" className="contact">
        <div className="container">
          <div className="success-message">
            <h2>Thank You!</h2>
            <p>We&apos;ve received your message and will get back to you soon.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2>Get In Touch</h2>
        <p className="section-subtitle">Ready to start your project? Let&apos;s talk.</p>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Tell us about your project..."
              rows={5}
            />
          </div>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          <button type="submit" className="btn btn-primary">
            {status === "submitting" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
