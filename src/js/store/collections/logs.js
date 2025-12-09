import { BaseCollection } from "./baseCollection.js";
import { query, collection, orderBy, where } from "firebase/firestore";
import { db } from "../../firebase.js";

class LogsCollection extends BaseCollection {
  constructor() {
    super("logs");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.query = query(
      collection(db, "logs"),
      where("timestamp", ">=", thirtyDaysAgo.toISOString()),
      orderBy("timestamp", "desc"),
    );
  }

  /**
   * Log types: auth, item, category, transaction, system
   */
  async log(type, action, details = {}) {
    return await this.add({
      type,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  async logAuth(action, details = {}) {
    return this.log("auth", action, details);
  }

  async logInventory(action, details = {}) {
    return this.log("item", action, details);
  }

  async logCategory(action, details = {}) {
    return this.log("category", action, details);
  }

  async logTransaction(action, details = {}) {
    return this.log("transaction", action, details);
  }

  async logSystem(action, details = {}) {
    return this.log("system", action, details);
  }
}

export const logsCollection = new LogsCollection();
