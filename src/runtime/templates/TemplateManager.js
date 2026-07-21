import { variableResolver } from "../variables/VariableResolver";

/**
 * Template catalog — in production, load from Laravel Template Manager API.
 */
export class TemplateManager {
  constructor() {
    /** @type {Map<string, {id:string,channel:string,subject?:string,body:string}>} */
    this.templates = new Map();
    this.#seedDefaults();
  }

  #seedDefaults() {
    const defaults = [
      {
        id: "whatsapp_reminder_v1",
        channel: "whatsapp",
        body: "Hi {{PatientName}}, reminder from {{hospital_name}} regarding {{MedicineName}}.",
      },
      {
        id: "sms_reminder_v1",
        channel: "sms",
        body: "Reminder: {{MedicineName}} at {{time}}. — {{hospital_name}}",
      },
      {
        id: "email_reminder_v1",
        channel: "email",
        subject: "Appointment Reminder — {{hospital_name}}",
        body: "Dear {{PatientName}},\n\nYour appointment with {{DoctorName}} is on {{AppointmentDate}}.\n\nRegards,\n{{hospital_name}}",
      },
      {
        id: "push_reminder_v1",
        channel: "push",
        body: "{{MedicineName}} reminder from {{hospital_name}}",
      },
    ];

    defaults.forEach((t) => this.templates.set(t.id, t));
  }

  register(template) {
    this.templates.set(template.id, template);
  }

  get(templateId) {
    return this.templates.get(templateId) ?? null;
  }

  list(channel = null) {
    const all = [...this.templates.values()];
    return channel ? all.filter((t) => t.channel === channel) : all;
  }

  /**
   * Render template with resolved variables.
   * @param {string} templateId
   * @param {import('../types').ExecutionContext} context
   */
  render(templateId, context) {
    const template = this.get(templateId);
    if (!template) {
      // Treat templateId as inline body if not in catalog
      return {
        channel: "unknown",
        subject: "",
        body: variableResolver.resolve(templateId, context),
      };
    }

    return {
      channel: template.channel,
      subject: template.subject
        ? variableResolver.resolve(template.subject, context)
        : "",
      body: variableResolver.resolve(template.body, context),
    };
  }
}

export const templateManager = new TemplateManager();
