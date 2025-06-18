import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const contactService = {
  async submitContactForm(formData) {
    try {
      const docRef = await addDoc(collection(db, "contactMessages"), {
        ...formData,
        createdAt: new Date(),
        status: "new",
      });
      return { id: docRef.id, ...formData };
    } catch (error) {
      throw new Error(`Failed to submit contact form: ${error.message}`);
    }
  },
};

export default contactService;
