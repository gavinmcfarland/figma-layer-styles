<script>
    import { fade } from "svelte/transition";

    import {
        Input,
        Type,
        IconButton,
        IconSwap,
        IconEllipses,
    } from "figma-plugin-ds-svelte";

    // ListItem

    export let style;

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

        console.log(style);

        console.log(event.currentTarget.parentNode.parentNode.parentNode);
        var listItem = event.currentTarget.parentNode.parentNode.parentNode;
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

    function openMenu(event) {
        var menu = event.currentTarget.getElementsByClassName("menu");
        menu[0].classList.toggle("show");
    }

    function closeMenu(event) {
        var menu = event.currentTarget.getElementsByClassName("more");
        for (let i = 0; i < menu.length; i++) {
            menu[i].children[1].classList.remove("show");
        }

        var editInputs = event.currentTarget.getElementsByClassName("editName");
        for (let i = 0; i < editInputs.length; i++) {
            editInputs[i].classList.remove("show");
        }
    }

    function onPageClick(e) {
        var menu = e.currentTarget.getElementsByClassName("more");

        for (let i = 0; i < menu.length; i++) {
            // TOTO: need to include/exclude input
            if (e.target === menu[i] || menu[i].contains(e.target)) {
                return;
            }
        }

        console.log("Clicked outside");
        closeMenu(e);
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
</style>

<Type class="list-item pl-xsmall pr-xxsmall flex place-center">
    <div class="editName pl-xxsmall" transition:fade={{ duration: 100 }}>
        <Input bind:value={styleBeingEdited.name} class="mb-xxsmall" />
    </div>
    <span style="flex-grow: 1;">{style.name}</span>
    <IconButton on:click={updateInstances(style.id)} iconName={IconSwap} />
    <!-- <IconButton on:click={removeStyle(style.id)} iconName={IconMinus} /> -->
    <span on:click={openMenu} class="more">
        <IconButton iconName={IconEllipses} />
        <div class="menu">
            <div class="triangle" />
            <a on:click={applyStyle(style.id)}>Apply</a>
            <!-- <a on:click={renameStyle(style.id, 'test')}>Rename</a> -->
            <a on:click={editStyle(event, style)}>Rename</a>
            <a on:click={removeStyle(style.id)}>Delete</a>
        </div>
    </span>
</Type>
