import { t } from "../services/translate";
import { hideLoader, showLoader } from "./commonUtil";
import { sendUINotification } from "./notificationUtil";
import { moveToTransferList } from "./transferListUtil";

export const moveUnassignedToTransferList = async (items) => {
  if (repositories.Item.isPileFull(ItemPile.TRANSFER)) {
    return sendUINotification(
      t("transferListFull"),
      UINotificationType.NEGATIVE
    );
  }
  showLoader();
  if (items) {
    moveToTransferList(items);
  }
  hideLoader();
};

const getUnassignedItems = () => {
  return new Promise((resolve) => {
    services.Item.requestUnassignedItems().observe(
      this,
      function (sender, { response: { items } }) {
        resolve(items);
      }
    );
  });
};
