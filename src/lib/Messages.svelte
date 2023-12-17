<script lang="ts">
  import { currentUser, pb } from "./pocketbase";
  import { onMount, onDestroy, afterUpdate } from "svelte";

  let newMessage: string;
  let messages: any[] = [];
  let messageDiv: HTMLDivElement;
  let unsubscribe: () => void;
  let loading = true;

  // to bottom
  function scrollToBottom() {
    messageDiv.scrollTop = messageDiv.scrollHeight;
  }

  afterUpdate(() => {
    scrollToBottom();
  });

  onMount(async () => {
    const resultList = await pb.collection("messages").getList(1, 50, {
      sort: "created",
      expand: "sender_user_id",
    });
    messages = resultList.items;
    loading = false;
    // console.log(messages);

    unsubscribe = await pb
      .collection("messages")
      .subscribe("*", async ({ action, record }) => {
        if (action === "create") {
          const sender_user_id = await pb
            .collection("users")
            .getOne(record.sender_user_id);
          record.expand = { sender_user_id };
          messages = [...messages, record];
        }
        if (action === "delete") {
          messages = messages.filter((m) => m.id !== record.id);
        }
      });
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  async function sendMessage() {
    const data = {
      message: newMessage,
      sender_user_id: $currentUser?.id,
      timestamp: Date.now(),
    };
    const cretedMessage = await pb.collection("messages").create(data);
    newMessage = "";
  }
</script>

<div bind:this={messageDiv} class="messages" id="messages">
  <!-- loading -->
  {#if loading}
    <p style="text-align: center; display: grid; align-self: center;">
      Loading...
    </p>
  {/if}
  {#each messages as message (message.id)}
    <div class="msg">
      <img
        class="avatar"
        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${message.expand?.sender_user_id?.username}`}
        alt=""
      />
      <div class="msg-content">
        <small>sent by @{message.expand?.sender_user_id?.name}</small>
        <div class="msg-text">{message.message}</div>
      </div>
    </div>
  {/each}
</div>

<div class="input">
  <input
    type="text"
    bind:value={newMessage}
    on:submit|preventDefault={sendMessage}
  />
  <button on:click={sendMessage}>Send</button>
</div>

<style>
  .messages {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    height: 50vh;
    overflow-y: scroll;
    overflow-x: hidden;
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-snap-align: end;
    scroll-snap-stop: normal;
  }

  .msg {
    display: flex;
    gap: 10px;
  }

  .msg-content {
    display: flex;
    flex-direction: column;
    text-align: start;
    gap: 5px;
  }

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }

  .input {
    display: flex;
    gap: 10px;
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  .input input {
    flex-grow: 1;
    padding: 10px;
    border-radius: 5px;
  }
</style>
