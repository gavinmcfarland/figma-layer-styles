<script>
    import { loop_guard } from "svelte/internal";

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

    function styleCss(style) {
        var string = "";
        var border = "";
        var background = "";
        var backgroundRgba = "";
        var borderRgba = "";
        var borderWeight = "";
        var borderRadius = "";

        if (style.node.strokes) {
            borderRgba = `rgba(${style.node.strokes[0].color.r * 255}, ${
                style.node.strokes[0].color.g * 255
            }, ${style.node.strokes[0].color.b * 255}, ${
                style.node.strokes[0].opacity
            })`;
            borderWeight = `${style.node.strokeWeight / 4}px`;
            border = `border: ${borderWeight} solid ${borderRgba};`;
        }

        if (style.node.fills) {
            backgroundRgba = `rgba(${style.node.fills[0].color.r * 255}, ${
                style.node.fills[0].color.g * 255
            }, ${style.node.fills[0].color.b * 255}, ${
                style.node.fills[0].opacity
            })`;
            background = `background-color: ${backgroundRgba};`;
        }

        if (style.node.cornerRadius) {
            borderRadius = `border-radius: ${style.node.cornerRadius / 4}px`;
        } else {
            borderRadius = `border-radius: ${style.node.topLeftRadius / 4}px ${
                style.node.topRightRadius / 4
            }px ${style.node.bottomRightRadius / 4}px ${
                style.node.bottomLeftRadius / 4
            }px`;
        }

        string = `${background} ${border} ${borderRadius}`;

        return string;
    }

    let field;

    let mousePosX;
    let mousePosY;

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
        closeMenu();
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
        var focusedElement;

        input.focus();
        // input.addEventListener("focus", () => {
        //     input.select();
        // });
        // input.focus();
        // input.select();
        closeMenu();

        input.addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();

                renameStyle(styleBeingEdited.id, styleBeingEdited.name);
                document.activeElement.blur();
                hideInput();
                closeMenu();
                // Trigger the button element with a click
                // document.getElementById("myBtn").click();
            }
        });

        // closeMenu(event, style);
    }

    function openMenu(event, style) {
        mousePosX = event.clientX;
        mousePosY = event.clientY;
        menu.classList.toggle("show");
    }

    function closeMenu() {
        menu.classList.remove("show");

        // var editInputs = event.currentTarget.getElementsByClassName("editName");
        // for (let i = 0; i < editInputs.length; i++) {
        // field.classList.remove("show");
        // }
    }

    function hideInput() {
        field.classList.remove("show");
        renameStyle(styleBeingEdited.id, styleBeingEdited.name);
    }

    function onPageClick(e) {
        if (
            // e.target === more ||
            field.contains(e.target) ||
            menu.contains(e.target)
        ) {
            return;
        }
        // if (field.contains(e.target) || menu.contains(e.target)) {
        //     console.log("menu clicked");
        // } else {
        //     console.log("Clicked outside menu");
        // }

        console.log("Clicked outside");
        hideInput();
        closeMenu();
    }

    window.addEventListener("blur", () => {
        hideInput();
        closeMenu();
    });
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
        width: 80px;
    }

    .menu > span {
        line-height: 24px;
        padding-left: 16px;
        padding-right: 16px;
        position: relative;
        display: block;
        user-select: none;
    }

    .menu > span:hover {
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
        display: none;
    }

    .editName {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        margin-left: -8px;
        width: -webkit-fill-available;
    }

    #listItem {
        color: red;
        user-select: none;
    }

    .layer-icon {
        /* border: 1px solid #dcdcdc; */
        /* background: #f3f3f3; */
        /* border-radius: 999px; */
        width: 18px;
        height: 18px;
        margin-right: 8px;
    }

    .field {
        position: relative;
    }
</style>

<svelte:body on:click={onPageClick} />

<div
    id="listItem{style.id}"
    bind:this={listItem}
    on:contextmenu={openMenu(event, style)}>
    <Type class="pl-xsmall pr-xxsmall flex place-center">
        <span class="layer-icon" style={styleCss(style)} />
        <div class="field flex place-center" style="flex-grow: 1;">
            <div
                bind:this={field}
                class="editName"
                transition:fade={{ duration: 100 }}>
                <Input bind:value={styleBeingEdited.name} class="mb-xxsmall" />
            </div>
            <span style="flex-grow: 1; user-select: none;">{style.name}</span>
            <IconButton
                on:click={updateInstances(style.id)}
                iconName={IconSwap} />
        </div>

        <div
            class="menu"
            bind:this={menu}
            style="left: {mousePosX}; top: {mousePosY}">
            <div class="triangle" />
            <span on:click={applyStyle(style.id)}>Apply</span>
            <!-- <a on:click={renameStyle(style.id, 'test')}>Rename</a> -->
            <span on:click={editStyle(event, style)}>Rename</span>
            <span on:click={removeStyle(style.id)}>Delete</span>
        </div>
    </Type>
</div>
