package com.github.matteo099.resources;

import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.jboss.logging.Logger;

import com.github.matteo099.model.Metric;
import com.github.matteo099.model.projections.DieAggregationResult;
import com.github.matteo099.model.projections.OrderAggregationResult;
import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.services.DieService;
import com.github.matteo099.services.MetricService;
import com.github.matteo099.services.OrderService;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/metric-controller")
public class MetricResource {

    @Inject
    Logger logger;

    @Inject
    MetricService metricService;

    @Inject
    OrderService orderService;

    @Inject
    DieService dieService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/cpu")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return cpu usage (0 - 100)", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Metric.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute CPU usage", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getCPU() {
        try {
            logger.info("Computing cpu usage");
            return Response.ok()
                    .entity(metricService.computeCPU())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/ram")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return ram usage (0 - 100)", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Metric.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute RAM usage", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getRAM() {
        try {
            logger.info("Computing ram usage");
            return Response.ok()
                    .entity(metricService.computeRAM())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/hdd")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return hdd usage (0 - 100)", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = Metric.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute HDD usage", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getHDD() {
        try {
            logger.info("Computing hdd usage");
            return Response.ok()
                    .entity(metricService.computeHDD())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/order-count")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return the count of the orders", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Long.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute the count of the orders", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getTotalOrdersCount() {
        try {
            logger.info("Computing the count of the orders");
            return Response.ok()
                    .entity(orderService.getCount())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/order-distribution")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return orders distribution", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = OrderAggregationResult.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute orders distribution", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getOrderDistribution() {
        try {
            logger.info("Computing order distribution");
            return Response.ok()
                    .entity(orderService.getDistribution())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/top-orders")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return the top n orders", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = OrderAggregationResult.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute the top n orders", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getTopOrders() {
        try {
            int n = 10;
            logger.infof("Computing the top %d orders", n);
            return Response.ok()
                    .entity(orderService.getTop(n, null, null))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/die-count")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return the count of the dies", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Long.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute the count of the dies", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getTotalDiesCount() {
        try {
            logger.info("Computing the count of the dies");
            return Response.ok()
                    .entity(dieService.getCount())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/die-material-distribution")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return die distribution by material", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = DieAggregationResult.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute die distribution by material", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getDieDistributionByMaterial() {
        try {
            logger.info("Computing die distribution by material");
            return Response.ok()
                    .entity(dieService.getMaterialDistribution())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/die-color-distribution")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Return die distribution by color", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = DieAggregationResult.class))),
            @APIResponse(responseCode = "500", description = "Unable to compute die distribution by color", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getDieDistributionByColor() {
        try {
            logger.info("Computing die distribution by color");
            return Response.ok()
                    .entity(dieService.getTypeDistribution())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }
}
