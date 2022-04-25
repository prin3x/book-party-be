import { IPartyOperation } from "party/dto/find-party.dto";
import { ISimpleOperation, SimpleQueryParamsDTO } from "./simple-query.dto";

export function parseQueryString(q: SimpleQueryParamsDTO): ISimpleOperation {
  const rtn: IPartyOperation = {
    page: +q?.page || 1,
    limit: +q?.limit ? (+q?.limit > 100 ? 100 : +q?.limit) : 10,
    skip: (q?.page - 1) * q?.limit,
    orderBy: q?.orderBy || 'id',
    order: 'ASC',
    search: q?.search ? q?.search.trim() : '',
  };

  q.order = q?.order ? q?.order.toUpperCase() : '';
  rtn.order = q?.order != 'ASC' && q?.order != 'DESC' ? 'DESC' : q?.order;
  rtn.skip = (rtn.page - 1) * rtn.limit;

  return rtn;
}
