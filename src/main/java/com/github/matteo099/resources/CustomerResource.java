package com.github.matteo099.resources;

import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.jboss.logging.Logger;

import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.services.CustomerService;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/customer-controller")
public class CustomerResource {

    @Inject
    CustomerService customerService;

    @Inject
    Logger logger;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/list-customers")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "List customers", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = Customer.class))),
            @APIResponse(responseCode = "500", description = "Unable to list customers", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response listCustomers() {
        try {
            logger.info("listing customers");
            var customers = customerService.listAll();
            logger.info(customers.size());
            return Response.ok().entity(customers).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }
}
