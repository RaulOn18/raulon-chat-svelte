<script lang="ts">
  import Messages from "./Messages.svelte";
  import { currentUser, pb } from "./pocketbase";
  let username: string;
  let password: string;

  async function login() {
    await pb.collection("users").authWithPassword(username, password);
  }

  async function signUp() {
    try {
      const data = {
        username: username,
        email: "test@example.com",
        emailVisibility: true,
        password: password,
        passwordConfirm: password,
        name: username,
      };
      console.log("has been Created");
      const createdUser = await pb.collection("users").create(data);
      await login();
    } catch (error) {
      console.log(error);
    }
  }
</script>

{#if $currentUser}
  <p>Signed as {$currentUser.username}</p>
  <button on:click={() => pb.authStore.clear()}>Log out</button>
  <Messages />
{:else}
  <form name="login" autocomplete="on" id="login" on:submit|preventDefault>
    <input
      type="text"
      name="username"
      placeholder="Username"
      bind:value={username}
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      bind:value={password}
    />

    <button on:click={signUp}>Sign Up</button>
    <button on:click={login}>Login</button>
  </form>
{/if}
