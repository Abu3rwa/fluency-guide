class Task {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || "";
    this.description = data.description || "";
    this.type = data.type || "quiz";
    this.status = data.status || "draft";
    this.sections = data.sections || [];
    this.passingScore = data.passingScore || 70;
    this.timeLimit = data.timeLimit || 30;
    this.attemptsAllowed = data.attemptsAllowed || 3;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      status: this.status,
      sections: this.sections,
      passingScore: this.passingScore,
      timeLimit: this.timeLimit,
      attemptsAllowed: this.attemptsAllowed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Task;
