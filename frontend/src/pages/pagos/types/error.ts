export class PagosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PagosError';
  }
}

export class GetAtletaError extends PagosError {}
export class GetMatriculasError extends PagosError {}
export class GetCoberturaError extends PagosError {}
export class CreatePagoError extends PagosError {}