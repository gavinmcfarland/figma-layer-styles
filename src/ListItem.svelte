<script>
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

    // async function decode(bytes) {
    //     const url = URL.createObjectURL(new Blob([bytes]));
    //     console.log(url);
    //     return new Promise((resolve, reject) => {
    //         const img = new Image();
    //         img.onload = () => resolve(img);
    //         img.onerror = () => reject();
    //         img.src = url;
    //         resolve(img);
    //     });
    // }

    // function _arrayBufferToBase64(buffer) {
    //     var binary = "";
    //     var bytes = new Uint8Array(buffer);
    //     var len = bytes.byteLength;
    //     for (var i = 0; i < len; i++) {
    //         binary += String.fromCharCode(bytes[i]);
    //     }
    //     return window.btoa(binary);
    // }

    // export function imageBufferToSrc(imageBuffer: Uint8Array) {
    //     return URL.createObjectURL(
    //         new Blob([imageBuffer], { type: "image/png" })
    //     );
    // }

    // async function createImageUrl(imageBytes) {
    //     // const byteArray = new Uint8Array(imageBytes);
    //     // console.log(byteArray);
    //     // var thing = btoa(
    //     //     new Uint8Array(imageBytes).reduce(
    //     //         (data, byte) => data + String.fromCharCode(byte),
    //     //         ""
    //     //     )
    //     // );
    //     // console.log(Buffer.from(imageBytes).toString("base64"));
    //     const blob = new Blob([imageBytes]);
    //     var reader = new FileReader();
    //     reader.readAsDataURL(blob);

    //     return new Promise((resolve) => {
    //         reader.onloadend = function () {
    //             var imageUrl = reader.result;

    //             resolve(imageUrl);
    //         };
    //     });
    // }

    // function base64(imageBytes) {
    //     return btoa(
    //         new Uint8Array(imageBytes).reduce(
    //             (data, byte) => data + String.fromCharCode(byte),
    //             ""
    //         )
    //     );
    // }

    // function SVGFromBuffer(buffer) {
    //     const imgBase64 =
    //         "data:image/svg+xml;base64," +
    //         btoa(
    //             new Uint8Array(buffer).reduce((data, byte) => {
    //                 return data + String.fromCharCode(byte);
    //             }, "")
    //         );
    //     return imgBase64;
    // }

    // async function encode(canvas, ctx, imageData) {
    //     ctx.putImageData(imageData, 0, 0);
    //     return await new Promise((resolve, reject) => {
    //         canvas.toBlob((blob) => {
    //             const reader = new FileReader();
    //             reader.onload = () => resolve(new Uint8Array(reader.result));
    //             reader.onerror = () =>
    //                 reject(new Error("Could not read from blob"));
    //             reader.readAsArrayBuffer(blob);
    //         });
    //     });
    // }

    // function arrayBufferToBase64(buffer) {
    //     console.log(buffer);
    //     var binary = "";
    //     var bytes = new Uint8Array(buffer);
    //     var len = bytes.byteLength;
    //     for (var i = 0; i < len; i++) {
    //         binary += String.fromCharCode(bytes[i]);
    //     }
    //     return window.btoa(binary);
    // }

    // function toBase64(u8) {
    //     console.log(btoa(String.fromCharCode.apply(null, u8)));
    //     return btoa(String.fromCharCode.apply(null, u8));
    // }

    function PNGFromBuffer(buffer) {
        const imgBase64 =
            "data:image/png;base64," +
            btoa(
                new Uint8Array(buffer).reduce((data, byte) => {
                    return data + String.fromCharCode(byte);
                }, "")
            );
        return imgBase64;
    }

    function styleCss(style) {
        var string = "";
        var border = "";
        var background = "";
        var backgroundRgba = "";
        var borderRgba = "";
        var borderWeight = "";
        var borderRadius = "";
        var boxShadow = "";
        var imageBg = "";

        if (style.base64 || style.arrayBuffer) {
            console.log(PNGFromBuffer(style.arrayBuffer));
            imageBg = `background-image: url(${style.base64}); background-size: contain;`;
        }

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

                if (fill.type === "SOLID") {
                    fills.push(
                        `linear-gradient( rgba(${fill.color.r * 255}, ${
                            fill.color.g * 255
                        }, ${fill.color.b * 255}, ${fill.opacity}),
                    rgba(${fill.color.r * 255}, ${fill.color.g * 255}, ${
                            fill.color.b * 255
                        }, ${fill.opacity}))`
                    );
                }
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
                        `${effect.offset.x / 2}px ${effect.offset.y / 2}px ${
                            effect.radius / 2
                        }px rgba(${effect.color.r * 255}, ${
                            effect.color.g * 255
                        }, ${effect.color.b * 255}, ${effect.color.a})`
                    );
                }

                if (effect.type === "INNER_SHADOW") {
                    boxShadows.push(
                        `inset ${effect.offset.x / 2}px ${
                            effect.offset.y / 2
                        }px ${effect.radius / 2}px rgba(${
                            effect.color.r * 255
                        }, ${effect.color.g * 255}, ${effect.color.b * 255}, ${
                            effect.color.a
                        })`
                    );
                }
            }

            // filter: drop-shadow(30px 10px 4px #4444dd)

            boxShadow = `box-shadow: ${boxShadows.join(" ")};`;
        }

        string = `${background} ${border} ${borderRadius} ${boxShadow} ${imageBg}`;

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
        closeMenu();
        // event.preventDefault();
        var rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.classList.toggle("blue-bg");

        mousePosX = event.clientX - rect.left;
        mousePosY = event.clientY - rect.top;

        if (mousePosX > 140) {
            mousePosX = 136;
            console.log("off screen");
        }
        if (rect.top > 231) {
            mousePosY = -40;
            console.log("off screen");
        }

        menu.classList.toggle("show");
    }

    function closeMenu() {
        var menus = document.getElementById("styles").querySelectorAll(".menu");

        for (var menu of menus) {
            // console.log(menu);
            menu.classList.remove("show");
            menu.parentNode.parentNode.classList.remove("blue-bg");
            // console.log(menu.parentNode.parentNode).classList.remove("blue-bg");
            // menu.parent
        }

        // listItem.classList.remove("blue-bg");
        // var editInputs = event.currentTarget.getElementsByClassName("editName");
        // for (let i = 0; i < editInputs.length; i++) {
        // field.classList.remove("show");
        // }
    }

    function hideInput() {
        if (listItem) field.classList.remove("show");
        if (listItem) renameStyle(styleBeingEdited.id, styleBeingEdited.name);
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
        if (listItem) listItem.classList.remove("blue-bg");
    }

    window.addEventListener("blur", () => {
        hideInput();
        closeMenu();
        if (listItem) listItem.classList.remove("blue-bg");
    });
</script>

<svelte:body on:click={onPageClick} />

<div
    class="list-item"
    style="position: relative;"
    id="listItem{style.id}"
    bind:this={listItem}
    on:contextmenu={openMenu(event, style)}
>
    <div on:click={applyStyle(style.id)} style="display: flex; flex-grow: 1;">
        <Type class="pl-xsmall pr-xxsmall flex place-center">
            <span class="layer-icon" style={styleCss(style)} />
            <div class="field flex place-center" style="flex-grow: 1;">
                <div
                    bind:this={field}
                    class="editName"
                    transition:fade={{ duration: 100 }}
                >
                    <Input
                        bind:value={styleBeingEdited.name}
                        class="mb-xxsmall"
                    />
                </div>
                <span style="flex-grow: 1; user-select: none;"
                    >{style.name}</span
                >
                <!-- <IconButton on:click={applyStyle(style.id)} iconName={IconPlus} /> -->
            </div>
        </Type>
    </div>
    <Type class="flex place-center">
        <div
            class="menu"
            bind:this={menu}
            style="left: {mousePosX}px; top: {mousePosY}px"
        >
            <div class="triangle" />
            <span on:click={updateInstances(style.id)}>Refresh</span>
            <span on:click={editLayerStyle(style.id)}>Edit</span>

            <!-- <span on:click={updateLayerStyle(style.id)}>Update</span> -->

            <!-- <a on:click={renameStyle(style.id, 'test')}>Rename</a> -->
            <span on:click={editStyle(event, style)}>Rename</span>
            <span class="divider" />
            <span on:click={removeStyle(style.id)}>Delete</span>
        </div>
    </Type>
</div>

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
        width: 100px;
    }

    .menu > span {
        line-height: 24px;
        padding-left: 16px;
        padding-right: 16px;
        position: relative;
        display: block;
        user-select: none;
    }

    .menu > span:not(.divider):hover {
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
    .divider {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        display: block;
        margin-top: 8px;
        margin-bottom: 8px;
    }
</style>
