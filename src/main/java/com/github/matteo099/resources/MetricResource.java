package com.github.matteo099.resources;

import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.jboss.logging.Logger;

import com.github.matteo099.model.Metric;
import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.services.MetricService;

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

}
