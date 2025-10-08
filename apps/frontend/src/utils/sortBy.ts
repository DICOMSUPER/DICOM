
export default function sortBy(...fields: (string | { name: string; primer?: (value: any) => any; reverse?: boolean })[]) {
  var n_fields = fields.length;

  return function (A: any, B: any) {
    var a, b, field, key, reverse, result, i;

    for (i = 0; i < n_fields; i++) {
      result = 0;
      field = fields[i];

      key = typeof field === 'string' ? field : field.name as string;
      key = typeof field === 'string' ? field : field.name;
      a = A[key];
      b = B[key];

      if (typeof field !== 'string' && typeof field.primer !== 'undefined') {
        a = field.primer(a);
        b = field.primer(b);
      }

      reverse = typeof field !== 'string' && field.reverse ? -1 : 1;

      if (a < b) {
        result = reverse * -1;
      }

      if (a > b) {
        result = reverse * 1;
      }

      if (result !== 0) {
        break;
      }
    }

    return result;
  };
}
