export const PROJECT_STATUSES = ["PENDING", "DOING", "COMPLETED"];
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
export const PAYMENT_STATUSES = ["UNPAID", "PARTIAL", "PAID"];
export const CURRENCIES = ["PHP", "USD"];

export const statusMeta = {
  PENDING: { label: "Pending", tone: "warning" },
  DOING: { label: "Doing", tone: "default" },
  COMPLETED: { label: "Completed", tone: "success" },
};

export const priorityMeta = {
  LOW: { label: "Low", tone: "secondary" },
  MEDIUM: { label: "Medium", tone: "warning" },
  HIGH: { label: "High", tone: "danger" },
};

export const paymentMeta = {
  UNPAID: { label: "Unpaid", tone: "danger" },
  PARTIAL: { label: "Partial", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
};
