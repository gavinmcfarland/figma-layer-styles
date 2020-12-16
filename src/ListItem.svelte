<script>
    import { loop_guard } from "svelte/internal";

    import { fade } from "svelte/transition";
    import { afterUpdate } from "svelte";

    import {
        Input,
        Type,
        IconButton,
        IconSwap,
        IconPlus,
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
        var boxShadow = "";

        if (style.node.strokes && style.node.strokes.length > 0) {
            if (style.node.strokes[0].visible) {
                borderRgba = `rgba(${style.node.strokes[0].color.r * 255}, ${
                    style.node.strokes[0].color.g * 255
                }, ${style.node.strokes[0].color.b * 255}, ${
                    style.node.strokes[0].opacity
                })`;

                var borderStyle = "solid";

                if (
                    style.node.dashPattern &&
                    style.node.dashPattern.length > 0
                ) {
                    borderStyle = "dashed";
                }

                borderWeight = `${style.node.strokeWeight}px`;
                border = `border: ${borderWeight} ${borderStyle} ${borderRgba};`;
            }
        }

        if (style.node.fills && style.node.fills.length > 0) {
            var fills = [];
            for (let i = 0; i < style.node.fills.length; i++) {
                var fill = style.node.fills[i];

                fills.push(
                    `linear-gradient( rgba(${fill.color.r * 255}, ${
                        fill.color.g * 255
                    }, ${fill.color.b * 255}, ${fill.opacity}),
                    rgba(${fill.color.r * 255}, ${fill.color.g * 255}, ${
                        fill.color.b * 255
                    }, ${fill.opacity}))`
                );
            }

            background = `background-image: ${fills.reverse().join(", ")};`;
        }

        if (style.node.cornerRadius) {
            borderRadius = `border-radius: ${style.node.cornerRadius / 2}px;`;
        } else {
            borderRadius = `border-radius: ${style.node.topLeftRadius / 3}px ${
                style.node.topRightRadius / 3
            }px ${style.node.bottomRightRadius / 3}px ${
                style.node.bottomLeftRadius / 3
            }px;`;
        }

        if (style.node.effects) {
            var boxShadows = [];
            for (let i = 0; i < style.node.effects.length; i++) {
                var effect = style.node.effects[i];

                if (effect.type === "DROP_SHADOW") {
                    boxShadows.push(
                        `drop-shadow(${effect.offset.x / 2}px ${
                            effect.offset.y / 2
                        }px ${effect.radius / 2}px rgba(${
                            effect.color.r * 255
                        }, ${effect.color.g * 255}, ${effect.color.b * 255}, ${
                            effect.color.a
                        }))`
                    );
                }
            }

            // filter: drop-shadow(30px 10px 4px #4444dd)

            boxShadow = `filter: ${boxShadows.join(" ")};`;
        }

        string = `${background} ${border} ${borderRadius} ${boxShadow}`;

        return string;
    }

    let field;

    let mousePosX;
    let mousePosY;

    let styleBeingEdited = {
        name: "",
    };

    function updateInstances(id) {
        closeMenu();
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
        closeMenu();
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

    function updateLayerStyle(id) {
        closeMenu();
        parent.postMessage(
            {
                pluginMessage: {
                    type: "update-style",
                    id,
                },
            },
            "*"
        );
    }

    function editLayerStyle(id) {
        closeMenu();
        parent.postMessage(
            {
                pluginMessage: {
                    type: "edit-layer-style",
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
        closeMenu();
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
        listItem.classList.add("blue-bg");

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
        var rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.classList.toggle("blue-bg");
        mousePosX = event.clientX - rect.left;
        mousePosY = event.clientY - rect.top;

        menu.classList.toggle("show");
    }

    function closeMenu() {
        menu.classList.remove("show");
        // listItem.classList.remove("blue-bg");
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

        hideInput();
        closeMenu();
        listItem.classList.remove("blue-bg");
    }

    window.addEventListener("blur", () => {
        hideInput();
        closeMenu();
        listItem.classList.remove("blue-bg");
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
        width: 90px;
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
        top: -8px;
        left: 0;
        margin-left: -8px;
        width: 196px;
    }

    .list-item {
        user-select: none;
        display: flex;
    }

    .list-item > * {
        user-select: none;
    }

    .list-item:hover {
        background-color: #daebf7;
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

    :global(.blue-bg) {
        background-color: #daebf7;
    }
</style>

<svelte:body on:click={onPageClick} />

<div
    class="list-item"
    style="position: relative;"
    id="listItem{style.id}"
    bind:this={listItem}
    on:contextmenu={openMenu(event, style)}>
    <div on:click={applyStyle(style.id)} style="display: flex; flex-grow: 1;">
        <Type class="pl-xsmall pr-xxsmall flex place-center">
            <span class="layer-icon" style={styleCss(style)} />
            <div class="field flex place-center" style="flex-grow: 1;">
                <div
                    bind:this={field}
                    class="editName"
                    transition:fade={{ duration: 100 }}>
                    <Input
                        bind:value={styleBeingEdited.name}
                        class="mb-xxsmall" />
                </div>
                <span
                    style="flex-grow: 1; user-select: none;">{style.name}</span>
                <!-- <IconButton on:click={applyStyle(style.id)} iconName={IconPlus} /> -->
            </div>
        </Type>
    </div>
    <Type class="flex place-center">
        <div
            class="menu"
            bind:this={menu}
            style="left: {mousePosX}px; top: {mousePosY}px">
            <div class="triangle" />
            <!-- <span on:click={editLayerStyle(style.id)}>Edit Style</span> -->
            <!-- <span on:click={updateLayerStyle(style.id)}>Update</span> -->
            <span on:click={updateInstances(style.id)}>Refresh</span>
            <!-- <a on:click={renameStyle(style.id, 'test')}>Rename</a> -->
            <span on:click={editStyle(event, style)}>Rename</span>
            <span on:click={removeStyle(style.id)}>Delete</span>
        </div>
    </Type>
</div>
