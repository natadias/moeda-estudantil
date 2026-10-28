export const formatarCpf = (cpf = '') => cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
export const formatarCnpj = (cnpj = '') => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
export const formatarCep = (cep = '') => cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
