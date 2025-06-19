import { writable } from 'svelte/store'

export let contextMenus = writable<any>([])
export let selectedStyles = writable<string[]>([])
