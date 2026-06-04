/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponsePaymentResponse } from '../models/ApiResponsePaymentResponse';
import type { ApiResponseString } from '../models/ApiResponseString';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { PaymentRequest } from '../models/PaymentRequest';
import type { VNPayIPNResponse } from '../models/VNPayIPNResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentControllerService {
    /**
     * @returns ApiResponsePaymentResponse OK
     * @throws ApiError
     */
    public static cancelPayment({
        orderId,
        paymentMethod,
    }: {
        orderId: string,
        paymentMethod: 'VN_PAY' | 'MOMO',
    }): CancelablePromise<ApiResponsePaymentResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/payments/cancel',
            query: {
                'orderId': orderId,
                'paymentMethod': paymentMethod,
            },
        });
    }
    /**
     * @returns ApiResponseString OK
     * @throws ApiError
     */
    public static requestMomoPayment({
        requestBody,
    }: {
        requestBody: PaymentRequest,
    }): CancelablePromise<ApiResponseString> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/payments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static handleMoMoCallback({
        requestBody,
    }: {
        requestBody: Record<string, string>,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/payments/momo-callback',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns VNPayIPNResponse OK
     * @throws ApiError
     */
    public static handleVnPayIpn(): CancelablePromise<VNPayIPNResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payments/IPN',
        });
    }
}
