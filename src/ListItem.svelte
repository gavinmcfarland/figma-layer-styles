<script>
    import { fade } from "svelte/transition";
    import { afterUpdate } from "svelte";

    import {
        Input,
        Type,
        IconButton,
        IconSwap,
        IconEllipses,
    } from "figma-plugin-ds-svelte";

    // ListItem

    export let style;
    let listItem;
    let menu;
    let more;
    let field;

    let styleBeingEdited = {
        name: "",
    };

    function updateInstances(id) {
        parent.postMessage(
            {
                pluginMessage: {
                    type: "update-instances",
                    id,
                },
            },
            "*"
        );
    }

    function applyStyle(id) {
        parent.postMessage(
            {
                pluginMessage: {
                    type: "apply-style",
                    id,
                },
            },
            "*"
        );
    }

    function removeStyle(id) {
        parent.postMessage(
            {
                pluginMessage: {
                    type: "remove-style",
                    id,
                },
            },
            "*"
        );
    }

    function renameStyle(id, name) {
        parent.postMessage(
            {
                pluginMessage: {
                    type: "rename-style",
                    id,
                    name,
                },
            },
            "*"
        );
    }

    function editStyle(event, style) {
        styleBeingEdited = style;

        var editName = listItem.querySelector(".editName");
        var input = listItem.querySelector("input");
        editName.classList.add("show");
        input.focus();
        input.addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();

                renameStyle(styleBeingEdited.id, styleBeingEdited.name);
                document.activeElement.blur();
                // Trigger the button element with a click
                // document.getElementById("myBtn").click();
            }
        });
        console.log(input);
    }

    function openMenu(event, style) {
        menu.classList.toggle("show");
    }

    function closeMenu(event, style) {
        more.children[1].classList.remove("show");

        // var editInputs = event.currentTarget.getElementsByClassName("editName");
        // for (let i = 0; i < editInputs.length; i++) {
        field.classList.remove("show");
        // }
    }

    function onPageClick(e) {
        if (e.target === more || more.contains(e.target)) {
            return;
        }

        console.log("Clicked outside");
        closeMenu(e, style);
    }
</script>

<style>
    :global(.menu) {
        display: none;
        color: white;
        position: absolute;
        right: 8px;
        z-index: 100;
    }

    .menu {
        color: #fff;
        padding: 8px 0;
        z-index: 100;
        background: #222222;
        box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.15),
            0px 5px 17px rgba(0, 0, 0, 0.2);
        border-radius: 2px;
    }

    .menu > a {
        line-height: 24px;
        padding-left: 16px;
        padding-right: 16px;
        position: relative;
        display: block;
    }

    .menu > a:hover {
        background-color: var(--blue);
        color: white;
    }

    .menu > .triangle {
        width: 12px;
        height: 12px;
        background-color: #222222;
        transform: rotate(45deg);
        position: absolute;
        top: -3px;
        right: 10px;
    }

    .editName {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
    }

    #listItem {
        color: red;
    }
</style>

<svelte:body on:click={onPageClick} />

<div id="listItem{style.id}" bind:this={listItem}>
    <Type class="list-item pl-xsmall pr-xxsmall flex place-center">
        <div
            bind:this={field}
            class="editName pl-xxsmall"
            transition:fade={{ duration: 100 }}>
            <Input bind:value={styleBeingEdited.name} class="mb-xxsmall" />
        </div>
        <span style="flex-grow: 1;">{style.name}</span>
        <IconButton on:click={updateInstances(style.id)} iconName={IconSwap} />
        <!-- <IconButton on:click={removeStyle(style.id)} iconName={IconMinus} /> -->
        <span on:click={openMenu(event, style)} class="more" bind:this={more}>
            <IconButton iconName={IconEllipses} />
            <div class="menu" bind:this={menu}>
                <div class="triangle" />
                <a on:click={applyStyle(style.id)}>Apply</a>
                <!-- <a on:click={renameStyle(style.id, 'test')}>Rename</a> -->
                <a on:click={editStyle(event, style)}>Rename</a>
                <a on:click={removeStyle(style.id)}>Delete</a>
            </div>
        </span>
    </Type>
</div>
