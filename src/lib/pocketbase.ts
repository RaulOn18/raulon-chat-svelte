import PocketBase from "pocketbase";

import { writable } from "svelte/store";

export const pb = new PocketBase("https://raulon-chat.pockethost.io");

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
  console.log("AuthStore changed", auth);
  currentUser.set(pb.authStore.model);
});
