<script lang="ts" context="module">
  import CremeModeIcon from "../assets/icons/CremeMode.avif";
  import DarkModeIcon from "../assets/icons/DarkMode.avif";
  import { writable } from "svelte/store";
  import {
    setLocalStorageItem,
    getLocalStorageItem,
  } from "../utils/localstorage";
  import { Themes } from "../domain/enums";

  // Create a svelte store with the theme found in localstorage or the paper default theme
  let foundTheme = getLocalStorageItem("theme");
  export const currentTheme = writable(foundTheme ? foundTheme : Themes.Paper);

  /**
   * Change the theme and store in localstorage
   * @param {string} newTheme
   */
  function changeTheme(newTheme) {
    currentTheme.set(newTheme);
    setLocalStorageItem("theme", newTheme);
  }
</script>

<div class="flex flex-col justify-between items-center">
  {#if $currentTheme === Themes.Dark}
    <button on:click={() => changeTheme(Themes.Paper)} class="theme">
      <img src={CremeModeIcon} alt="creme/paper mode icon" />
    </button>
  {:else}
    <button on:click={() => changeTheme(Themes.Dark)} class="theme">
      <img src={DarkModeIcon} alt="dark mode icon" />
    </button>
  {/if}
</div>

<style>
  .theme {
    width: 30px;
    cursor: pointer;
  }
</style>
