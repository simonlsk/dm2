import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Modal,
  PageHeader,
  Space,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import { inject, observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { RiCloseLine } from "react-icons/ri";
import { Filters } from "../Filters/Filters";
import { DataView } from "../Table/Table";
import { TabTitle } from "./tabs-pane";
import { TablePanel } from "./tabs-panel";
import { TabsStyles } from "./Tabs.styles";

const createTab = (views, data) => (view) => {
  const title = <TabTitle item={view} data={data} />;

  return (
    <Tabs.TabPane key={view.key} closable={false} tab={title}>
      <TablePanel views={views} view={view} />
      <DataView />
    </Tabs.TabPane>
  );
};

const FiltersSidebar = observer(({ views }) => {
  return views.sidebarEnabled && views.sidebarVisible ? (
    <div className="sidebar">
      <PageHeader
        title="Filters"
        extra={
          <Button
            key="close-filters"
            type="link"
            onClick={() => views.collapseFilters()}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <RiCloseLine size={24} />
          </Button>
        }
        style={{
          margin: "0 0 10px",
          padding: "0 10px",
          height: 24,
        }}
      />
      <Filters sidebar={true} filters={Array.from(views.selected.filters)} />
    </div>
  ) : null;
});

const ProjectSummary = observer(({ store }) => {
  return (
    <Space size="small">
      <Tag>
        Tasks: {store.total}
        <Divider type="vertical" />
        Completions: {store.totalCompletions}
        <Divider type="vertical" />
        Predictions: {store.totalPredictions}
      </Tag>

      <Tooltip title="Delete all tasks" placement="left">
        <Button
          size="small"
          danger
          ghost
          onClick={() => {
            Modal.confirm({
              title: `Deleting all tasks`,
              content: `Are you sure you want to delete all ${store.total} tasks?`,
              onOk() {
                getRoot(store).invokeAction("delete_tasks");
              },
            });
          }}
        >
          <DeleteOutlined />
        </Button>
      </Tooltip>
    </Space>
  );
});

export const TabsWrapper = inject("store")(
  observer(({ store }) => {
    const views = store.viewsStore;
    const activeTab = store.viewsStore.selected;

    return (
      <TabsStyles>
        <Tabs
          type="editable-card"
          activeKey={activeTab.key}
          onEdit={() => store.viewsStore.addView()}
          onChange={(key) => store.viewsStore.setSelected(key)}
          tabBarExtraContent={<ProjectSummary store={store.taskStore} />}
        >
          {store.viewsStore.all.map(createTab(views, store.dataStore.list))}
        </Tabs>
        <FiltersSidebar views={views} />
      </TabsStyles>
    );
  })
);
