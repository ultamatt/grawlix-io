const schema = {
  kind: "collectionType",
  collectionName: "contact_submissions",
  info: {
    singularName: "contact-submission",
    pluralName: "contact-submissions",
    displayName: "Contact Submission",
    description: "Messages submitted from the website contact form",
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {},
  attributes: {
    name: {
      type: "string",
      required: true,
      minLength: 2,
      maxLength: 120,
    },
    email: {
      type: "email",
      required: true,
    },
    message: {
      type: "text",
      required: true,
      minLength: 10,
      maxLength: 4000,
    },
    source: {
      type: "string",
      required: true,
      default: "website",
    },
    submittedAt: {
      type: "datetime",
      required: true,
    },
  },
};

export default schema;
