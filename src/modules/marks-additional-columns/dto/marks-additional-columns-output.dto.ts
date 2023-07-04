import MarksAdditionalColumnsEntity from '../entities/marks-additional-columns.entity';
import MarksAdditionalColumnValuesEntity from '../entities/marks-additional-column-values.entity';

export default interface MarksAdditionalColumnsOutputDTO
  extends MarksAdditionalColumnsEntity {
  values: MarksAdditionalColumnValuesEntity[];
}
