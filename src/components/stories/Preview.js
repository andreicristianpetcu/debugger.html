import React, { DOM as dom } from "react";
import { storiesOf, action } from "@kadira/storybook";
import _Preview from "../Editor/Preview";
const Preview = React.createFactory(_Preview.WrappedComponent);
import { L10N } from "devtools-launchpad";
import { setValue } from "devtools-config";
import * as I from "immutable";

import "../App.css";
import "../SecondaryPanes/Frames/Frames.css";
import "devtools-launchpad/src/lib/themes/dark-theme.css";

function createArrayPreview(name) {
  return {
    enumerable: true,
    writerable: true,
    configurable: true,
    value: {
      type: "object",
      actor: `server2.conn45.child1/${name}`,
      class: "Object",
      ownPropertyLength: 2,
      preview: {
        kind: "ArrayLike",
        ownProperties: {},
        ownPropertiesLength: 0,
        length: 1
      }
    }
  };
}

function createObjectPreview(name) {
  return {
    enumerable: true,
    writerable: true,
    configurable: true,
    value: {
      type: "Object",
      actor: `server2.conn45.child1/${name}`,
      class: "Object",
      ownPropertyLength: 2,
      preview: {
        kind: "object",
        ownProperties: {},
        ownPropertiesLength: 0,
        length: 1
      }
    }
  };
}

function createObjectGrip(id) {
  return {
    actor: `server2.conn45.child1/${id}`,
    type: "object",
    class: "Object",
    ownProperties: {},
    ownSymbols: {},
    safeGetters: {}
  };
}

function createFunctionGrip(name, parameterNames) {
  return {
    actor: `server2.conn45.child1/${name}`,
    type: "function",
    class: "Function",
    name,
    parameterNames
  };
}

const obj = {
  actor: "server2.conn45.child1/pausedobj81",
  type: "object",
  class: "Object",
  ownProperties: {
    cid: {
      value: "view4"
    },
    model: {
      value: {
        type: "object",
        actor: "server2.conn45.child1/pausedobj82",
        class: "Object",
        ownPropertyLength: 8,
        preview: {
          kind: "Object",
          ownProperties: {},
          ownPropertiesLength: 8,
          safeGetterValues: {}
        }
      }
    },
    $el: {
      value: {
        type: "object",
        actor: "server2.conn45.child1/pausedobj83",
        class: "Object",
        ownPropertyLength: 2,
        preview: {
          kind: "ArrayLike",
          length: 1
        }
      }
    },
    el: {
      value: {
        type: "object",
        actor: "server2.conn45.child1/pausedobj84",
        class: "HTMLLIElement",
        ownPropertyLength: 0,
        preview: {
          kind: "DOMNode",
          nodeType: 1,
          nodeName: "li",
          attributes: {},
          attributesLength: 0
        }
      }
    }
  },
  prototype: {
    type: "object",
    actor: "server2.conn45.child1/pausedobj426",
    class: "Object",
    ownPropertyLength: 14
  },
  ownSymbols: []
};

// NOTE: we need this for supporting L10N in storybook
// we can move this to a shared helper as we add additional stories
if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function PreviewFactory(options, { dir = "ltr", theme = "light" } = {}) {
  const themeClass = `theme-${theme}`;
  document.dir = dir;
  document.body.parentNode.className = themeClass;

  const target = {
    getBoundingClientRect: () => ({
      top: 200,
      left: 200,
      bottom: 80,
      width: 60,
      height: 30
    }),
    classList: { add: () => {}, remove: () => {} }
  };

  return dom.div(
    {
      className: "editor-wrapper",
      style: {
        width: "calc(100vw - 30px)",
        height: "calc(100vh - 30px)",
        margin: "10px"
      }
    },
    dom.div(
      {
        className: `preview ${themeClass}`,
        dir,
        style: {
          width: "100vw"
        }
      },
      Preview(
        Object.assign(
          {},
          {
            value: null,
            expression: null,
            loadedObjects: {},
            popoverTarget: target,
            loadObjectProperties: () => {},
            onClose: action("onClose")
          },
          options
        )
      )
    )
  );
}

const stories = storiesOf("Preview", module);

const options = [{}, { dir: "rtl" }, { theme: "dark" }];
options.forEach(option => {
  const { dir, theme } = option;
  const optionLabel = dir || theme || "";
  stories
    .add(`simple Object ${optionLabel}`, () => {
      setValue("features.previewWatch", false);
      return PreviewFactory(
        {
          value: obj,
          expression: "this",
          loadedObjects: I.Map().set(obj.actor, obj)
        },
        option
      );
    })
    .add(`simple Object with Input ${optionLabel}`, () => {
      setValue("features.previewWatch", true);
      return PreviewFactory(
        {
          value: obj,
          expression: "this",
          loadedObjects: { [obj.actor]: obj }
        },
        option
      );
    })
    .add(`Object with window keys ${optionLabel}`, () => {
      let grip = createObjectGrip("foo");
      grip.ownProperties.arr = createArrayPreview("arr");
      grip.ownProperties.location = createObjectPreview("location");
      return PreviewFactory(
        {
          value: grip,
          expression: "this",
          loadedObjects: { [grip.actor]: grip }
        },
        option
      );
    })
    .add(`Window Preview ${optionLabel}`, () => {
      let grip = createObjectGrip("foo");
      grip.class = "Window";
      grip.ownProperties.arr = createArrayPreview("arr");
      grip.ownProperties.location = createObjectPreview("location");
      return PreviewFactory(
        {
          value: grip,
          expression: "this",
          loadedObjects: { [grip.actor]: grip }
        },
        option
      );
    })
    .add(`Function Preview ${optionLabel}`, () => {
      let grip = createFunctionGrip("renderFoo", ["props", "state"]);
      return PreviewFactory(
        {
          value: grip,
          expression: "this",
          loadedObjects: { [grip.actor]: grip }
        },
        option
      );
    });
});
