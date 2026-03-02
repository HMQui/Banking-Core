import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficiaryDto } from './create-beneficiary.dto';

// Inherit all validation rules from CreateBeneficiaryDto but make them optional
export class UpdateBeneficiaryDto extends PartialType(CreateBeneficiaryDto) {}
