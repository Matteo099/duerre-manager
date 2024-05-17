package com.github.matteo099.resources;

import java.util.NoSuchElementException;

import org.bson.types.ObjectId;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.jboss.logging.Logger;

import com.github.matteo099.model.dao.OrderDao;
import com.github.matteo099.model.entities.Order;
import com.github.matteo099.model.entities.OrderStatus;
import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.model.wrappers.IdWrapper;
import com.github.matteo099.model.wrappers.MessageWrapper;
import com.github.matteo099.services.OrderService;

import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/order-controller")
public class OrderResource {

    @Inject
    OrderService orderService;

    @Inject
    Logger logger;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/create-order")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Order created", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = IdWrapper.class))),
            @APIResponse(responseCode = "500", description = "Unable to create order", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response createOrder(OrderDao order) {
        try {
            logger.info("creating order");
            String id = orderService.createOrder(order);
            return Response.ok().entity(IdWrapper.of(id)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/edit-order")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Order modified", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = IdWrapper.class))),
            @APIResponse(responseCode = "500", description = "Unable to modify order", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response editOrder(OrderDao order) {
        try {
            logger.info("editing order");
            String id = orderService.editOrder(order);
            return Response.ok().entity(IdWrapper.of(id)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/change-order-status/{id}/{status}")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Order modified", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Order.class))),
            @APIResponse(responseCode = "500", description = "Unable to modify order", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response changeOrderStatus(String id, OrderStatus status) {
        try {
            logger.info("changing order status id=" + id + " status=" + status);
            var order = orderService.updateOrderStatus(id, status);
            return Response.ok().entity(order).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/list-orders")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "List orders", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = Order.class))),
            @APIResponse(responseCode = "500", description = "Unable to list orders", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response listOrders() {
        try {
            logger.info("listing orders");
            var orders = orderService.listOrders();
            logger.info(orders.size());
            return Response.ok().entity(orders).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/order/{id}")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Get order", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Order.class))),
            @APIResponse(responseCode = "404", description = "Order not found", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class))),
            @APIResponse(responseCode = "500", description = "Unable to get order", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getOrder(String id) {
        try {
            logger.info("finding order with id " + id);
            return Response.ok().entity(orderService.findOrder(new ObjectId(id)).orElseThrow()).build();
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return Response.status(404).entity(ErrorWrapper.of(e)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/delete-order/{id}")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Delete order", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MessageWrapper.class))),
            @APIResponse(responseCode = "500", description = "Unable to delete order", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response deleteOrder(String id) {
        try {
            logger.info("deleting order with id " + id);
            return Response.ok().entity(MessageWrapper.of(orderService.deleteOrder(new ObjectId(id)))).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }
}
