class Lesson {
  constructor({
    id = "",
    title = "",
    description = "",
    content = "",
    type = "video", // video, text, quiz, assignment
    duration = 0,
    order = 0,
    status = "draft",
    resources = [],
    tasks = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.content = content;
    this.type = type;
    this.duration = duration;
    this.order = order;
    this.status = status;
    this.resources = resources;
    this.tasks = tasks;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Lesson({
      id: doc.id,
      title: data.title || "",
      description: data.description || "",
      content: data.content || "",
      type: data.type || "video",
      duration: data.duration || 0,
      order: data.order || 0,
      status: data.status || "draft",
      resources: data.resources || [],
      tasks: data.tasks || [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    });
  }

  toFirestore() {
    return {
      title: this.title,
      description: this.description,
      content: this.content,
      type: this.type,
      duration: this.duration,
      order: this.order,
      status: this.status,
      resources: this.resources,
      tasks: this.tasks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Lesson;
