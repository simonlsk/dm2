import { inject } from "mobx-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { FaCaretDown, FaChevronLeft, FaColumns } from "react-icons/fa";
import { Block, Elem } from "../../utils/bem";
import { Button } from "../Common/Button/Button";
import { FieldsButton } from "../Common/FieldsButton";
import { Icon } from "../Common/Icon/Icon";
import { Resizer } from "../Common/Resizer/Resizer";
import { Space } from "../Common/Space/Space";
import { DataView } from "../Table/Table";
import "./Label.styl";

const LabelingHeader = ({ SDK, onClick, isExplorerMode }) => {
  return (
    <Elem name="header" mod={{ labelStream: !isExplorerMode }}>
      <Space size="large">
        {SDK.interfaceEnabled("backButton") && (
          <Button
            icon={<FaChevronLeft style={{ marginRight: 4, fontSize: 16 }} />}
            type="link"
            onClick={onClick}
            style={{ fontSize: 18, padding: 0, color: "black" }}
          >
            Back
          </Button>
        )}

        {isExplorerMode ? (
          <FieldsButton
            wrapper={FieldsButton.Checkbox}
            icon={<Icon icon={FaColumns} />}
            trailingIcon={<Icon icon={FaCaretDown} />}
            title={"Fields"}
          />
        ) : null}
      </Space>
    </Elem>
  );
};

const injector = inject(({ store }) => {
  return {
    store,
  };
});

/**
 * @param {{store: import("../../stores/AppStore").AppStore}} param1
 */
export const Labeling = injector(
  ({ store }) => {
    const lsfRef = useRef();
    const SDK = store?.SDK;
    const view = store?.currentView;
    const { isExplorerMode } = store;

    const isLabelStream = useMemo(() => {
      return SDK.mode === 'labelstream';
    }, []);

    const closeLabeling = useCallback(() => {
      store.closeLabeling();
    }, [store]);

    const initLabeling = useCallback(() => {
      if (!SDK.lsf) SDK.initLSF(lsfRef.current);
      SDK.startLabeling();
    }, [lsfRef]);

    useEffect(() => {
      if (!isLabelStream) SDK.on("taskSelected", initLabeling);

      return () => {
        if (!isLabelStream) {
          SDK.off("taskSelected", initLabeling);
          SDK.destroyLSF();
        }
      };
    }, []);

    useEffect(() => {
      if (isLabelStream) {
        SDK.initLSF(lsfRef.current);
        SDK.startLabeling();
      }

      return () => {
        if (isLabelStream) {
          SDK.destroyLSF();
        }
      };
    }, []);

    const onResize = useCallback((width) => {
      view.setLabelingTableWidth(width);
      // trigger resize events inside LSF
      window.dispatchEvent(new Event("resize"));
    }, []);

    return (
      <Block name="label-view">
        {SDK.interfaceEnabled("labelingHeader") && (
          <LabelingHeader
            SDK={SDK}
            onClick={closeLabeling}
            isExplorerMode={isExplorerMode}
          />
        )}

        <Elem name="content">
          {isExplorerMode && (
            <Elem name="table">
              <Elem
                tag={Resizer}
                name="dataview"
                minWidth={200}
                showResizerLine={false}
                maxWidth={window.innerWidth * 0.35}
                initialWidth={240} // hardcoded as in main-menu-trigger
                onResizeFinished={onResize}
                style={{ display: "flex", flex: 1 }}
              >
                <DataView />
              </Elem>
            </Elem>
          )}

          <Elem name="lsf-wrapper" mod={{ mode: isExplorerMode ? "explorer" : "labeling" }}>
            <Elem
              ref={lsfRef}
              id="label-studio-dm"
              name="lsf-container"
              key="label-studio"
            />
          </Elem>
        </Elem>
      </Block>
    );
  },
);
