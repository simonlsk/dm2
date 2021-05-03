import { useSDK } from "../../../../providers/SDKProvider";
import { Block, Elem } from "../../../../utils/bem";
import { Tooltip } from "../../../Common/Tooltip/Tooltip";
import { Userpic } from "../../../Common/Userpic/Userpic";
import "./Annotators.styl";

export const Annotators = (cell) => {
  const {value, column} = cell;
  const sdk = useSDK();
  const userList = Array.from(value);
  const renderable = userList.slice(0, 10);
  const extra = userList.length - renderable.length;

  return (
    <Block name="annotators">
      {renderable.map(user => {
        return (
          <Elem key={`user-${user.id}`} name="item" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            sdk.invoke("userCellClick", [e, column.alias, user]);
          }}>
            <Tooltip title={user.fullName || user.email}>
              <Userpic user={user}/>
            </Tooltip>
          </Elem>
        );
      })}
      {(extra > 0) && (
        <Elem name="item" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          sdk.invoke("userCellCounterClick", [e, column.alias, userList]);
        }}>
          <Userpic username={`+${extra}`}/>
        </Elem>
      )}
    </Block>
  );
};

Annotators.filterable = false;
